import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Convert linear PCM 16-bit 24kHz audio to standard WAV container
function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitDepth = 16
): Buffer {
  if (pcmBuffer.length >= 12 && pcmBuffer.toString('ascii', 0, 4) === 'RIFF') {
    return pcmBuffer;
  }

  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  // RIFF Chunk
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);

  // Sub-chunk 1 (fmt)
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);

  // Sub-chunk 2 (data)
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Available voice personas
const VOICES = [
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Wanita',
    tone: 'Lembut, Manis, & Jelas',
    recommended: 'Pemberita RTM/TV3, Narasi, Pengumuman, Asisten Maya',
    description: 'Suara wanita Melayu yang sopan, sebutan baku Malaysia jernih dan lancar, sangat sesuai untuk voiceover rasmi dan penceritaan.',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Lelaki',
    tone: 'Ceria, Bertenaga, & Santai',
    recommended: 'Podcast, Iklan Radio Era/Hot FM, Video TikTok/Reels, Sukan',
    description: 'Suara pemuda Malaysia yang penuh semangat, gaya perbualan santai sembang kedai mamak atau promo iklan rancak.',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Lelaki',
    tone: 'Tegas, Berwibawa, & Mantap',
    recommended: 'Pengumuman Kerajaan, Berita Perdana, Dokumentari Sejarah, Ucapan',
    description: 'Suara lelaki berwibawa dengan sebutan Bahasa Melayu standard yang meyakinkan dan profesional.',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Lelaki',
    tone: 'Dalam, Tenang, & Syahdu',
    recommended: 'Buku Audio (Audiobook), Kisah Dongeng, Puisi/Sajak, Tazkirah & Meditasi',
    description: 'Suara bariton lelaki matang berfrekuensi dalam, lunak dan damai didengar untuk penceritaan panjang.',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Wanita',
    tone: 'Moden, Mesra, & Artikulatif',
    recommended: 'Khidmat Pelanggan, Tutorial, Pembentangan Korporat, VLOG',
    description: 'Suara gadis moden Malaysia dengan intonasi mesra, jelas bertutur Bahasa Melayu kontemporari.',
  },
];

// Endpoint: List available voices
app.get('/api/tts/voices', (_req: Request, res: Response) => {
  res.json({
    success: true,
    voices: VOICES,
    models: [
      {
        id: 'gemini-3.8-flash-lite-tts',
        name: 'Gemini 3.8 Flash-Lite TTS (Cepat & Ringan)',
        description: 'Sangat responsif dan optimal untuk membaca artikel, voiceover narasi, dan percakapan umum.',
        isDefault: true,
      },
      {
        id: 'gemini-3.8-flash-tts',
        name: 'Gemini 3.8 Flash TTS (Flagship High Fidelity)',
        description: 'Model tercanggih dengan ekspresi emosional maksimal, podcast, dual-speaker, dan efek vokal.',
        isDefault: false,
      },
    ],
  });
});

// Endpoint: Generate Single-Speaker TTS
app.post('/api/tts/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      text,
      voice = 'Kore',
      model = 'gemini-3.8-flash-lite-tts',
      style = 'Native Malay speaker from Malaysia with natural accent and proper intonation',
      accent = 'malay-standard',
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Teks wajib diisi' });
      return;
    }

    if (!apiKey) {
      res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di server environment.',
      });
      return;
    }

    // Build rich style prompt ensuring authentic Malaysian Malay speech
    let accentDirective = 'Authentic native Bahasa Melayu speaker from Malaysia (sebutan baku Malaysia), clear natural rhythm, fluent pronunciation.';
    if (accent === 'malay-santai') {
      accentDirective = 'Native Malaysian Malay speaker in casual friendly everyday conversation, relaxed Malaysian colloquial rhythm, cheerful tone.';
    } else if (accent === 'malay-berita') {
      accentDirective = 'Formal Malaysian news broadcast announcer (Buletin Utama TV3 / Berita RTM), authoritative, crisp standard Bahasa Melayu pronunciation.';
    } else if (accent === 'malay-kl') {
      accentDirective = 'Modern urban Kuala Lumpur Malaysian youth accent, natural contemporary Bahasa Melayu speech.';
    }

    const resolvedStyle = style ? `${accentDirective} ${style}` : accentDirective;

    const selectedModel =
      model === 'gemini-3.8-flash-tts' ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: resolvedStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const rawData = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType || 'audio/pcm;rate=24000';

    if (!rawData) {
      res.status(500).json({
        error: 'Model tidak mengembalikan data audio.',
        details: candidate?.finishReason || 'Unknown error',
      });
      return;
    }

    // Convert raw PCM to proper standard WAV container with 44-byte header
    const inputBuffer = Buffer.from(rawData, 'base64');
    const wavBuffer = pcmToWav(inputBuffer, 24000, 1, 16);
    const audioBase64 = wavBuffer.toString('base64');
    const audioDataUrl = `data:audio/wav;base64,${audioBase64}`;

    // Calculate approximate duration (24000 samples/sec * 2 bytes/sample = 48,000 bytes/sec)
    const durationSeconds = Number((inputBuffer.length / 48000).toFixed(2));

    res.json({
      success: true,
      audioUrl: audioDataUrl,
      duration: durationSeconds,
      sampleRate: 24000,
      format: 'audio/wav',
      voice,
      model: selectedModel,
      textLength: text.trim().length,
    });
  } catch (error: any) {
    console.error('Error in /api/tts/generate:', error);
    res.status(500).json({
      error: error?.message || 'Gagal menghasilkan suara dari teks.',
      details: error?.stack || String(error),
    });
  }
});

// Endpoint: Generate Dialogue / Multi-Speaker (Gemini 3.8 Flash TTS)
app.post('/api/tts/dialogue', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      turns, // Array of { speaker: "Speaker 1" | "Speaker 2", text: string, style?: string }
      speaker1 = { name: 'Danial', voice: 'Puck', style: 'Pemuda Malaysia yang ceria, ramah, dan santai' },
      speaker2 = { name: 'Aisyah', voice: 'Kore', style: 'Gadis Melayu sopan, lemah lembut, dan bijak' },
    } = req.body;

    if (!turns || !Array.isArray(turns) || turns.length === 0) {
      res.status(400).json({ error: 'Daftar percakapan (turns) tidak boleh kosong' });
      return;
    }

    if (!apiKey) {
      res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di server environment.',
      });
      return;
    }

    // Multi-speaker requires gemini-3.8-flash-tts
    const parts = turns.map((turn: { speaker: string; text: string; style?: string }) => {
      const isSpk1 = turn.speaker === speaker1.name;
      const defaultStyle = isSpk1 ? speaker1.style : speaker2.style;
      const combinedStyle = `Authentic native Malaysian Malay speaker, ${turn.style || defaultStyle || 'natural everyday spoken Bahasa Melayu'}`;
      return {
        text: `${turn.speaker}: ${turn.text}`,
        speechMetadata: {
          speaker: turn.speaker,
          style: combinedStyle,
        },
      };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: speaker1.name,
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: speaker1.voice },
                },
              },
              {
                speaker: speaker2.name,
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: speaker2.voice },
                },
              },
            ],
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const rawData = part?.inlineData?.data;

    if (!rawData) {
      res.status(500).json({
        error: 'Model tidak mengembalikan data audio dialog.',
        details: candidate?.finishReason || 'Unknown error',
      });
      return;
    }

    const inputBuffer = Buffer.from(rawData, 'base64');
    const wavBuffer = pcmToWav(inputBuffer, 24000, 1, 16);
    const audioBase64 = wavBuffer.toString('base64');
    const audioDataUrl = `data:audio/wav;base64,${audioBase64}`;
    const durationSeconds = Number((inputBuffer.length / 48000).toFixed(2));

    res.json({
      success: true,
      audioUrl: audioDataUrl,
      duration: durationSeconds,
      format: 'audio/wav',
      sampleRate: 24000,
    });
  } catch (error: any) {
    console.error('Error in /api/tts/dialogue:', error);
    res.status(500).json({
      error: error?.message || 'Gagal menghasilkan percakapan audio.',
    });
  }
});

// Endpoint: AI Script Polisher / Translator for TTS
app.post('/api/tts/enhance-text', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, action = 'polish' } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Teks wajib diisi' });
      return;
    }

    let prompt = '';
    if (action === 'polish') {
      prompt = `Anda ialah pakar skrip alih suara (voiceover) profesional Bahasa Melayu Malaysia.
Tugas anda ialah menyunting dan melancarkan teks berikut supaya berbunyi sangat asli, sedap didengar, dan natural apabila dibacakan oleh Text-to-Speech loghat orang Melayu Malaysia.
Pastikan:
- Gunakan kosa kata dan struktur tatabahasa lisan Bahasa Melayu Malaysia (contoh: "awak / saya / anda / kami / kita / dah / boleh / sangat / juga").
- Letakkan koma atau tanda baca di tempat jeda nafas yang sesuai.
- Kekalkan maksud asal.
- Balas HANYA dengan teks skrip yang telah diperelokkan tanpa mukadimah atau penerangan.

Teks asal:
"""${text}"""`;
    } else if (action === 'add_bursts') {
      prompt = `Anda ialah pengarah audio bagi dialog Bahasa Melayu Malaysia.
Teks ini akan dibaca oleh model TTS Gemini 3.8.
Model ini menyokong tag vokal khas:
- Backchanneling: |yeah|, |mhm|, |wah|
- Efek vokal: <laugh>, <gasp>, <breath>, <sigh>
Sisipkan 2-3 tag vokal yang sesuai dan natural mengikut gaya pertuturan orang Melayu Malaysia.
Balas HANYA teks yang telah disisipkan tag tersebut.

Teks asal:
"""${text}"""`;
    } else if (action === 'translate') {
      prompt = `Terjemahkan teks berikut ke dalam Bahasa Melayu Malaysia yang sangat lancar, sedap didengar, dan natural untuk bacaan alih suara (voiceover).
Balas HANYA dengan teks hasil terjemahan.

Teks asal:
"""${text}"""`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const enhanced = response.text?.trim() || text;

    res.json({
      success: true,
      enhancedText: enhanced,
    });
  } catch (error: any) {
    console.error('Error in /api/tts/enhance-text:', error);
    res.status(500).json({
      error: error?.message || 'Gagal memproses peningkatan teks.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Vocalis TTS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
