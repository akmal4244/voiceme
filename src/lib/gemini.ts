// Klien Gemini sisi pelayar — menggantikan server.ts supaya laman boleh dihos statik (GitHub Pages).
// Kunci API disimpan dalam localStorage pengguna sahaja, tidak pernah dibenamkan dalam kod.
import { GoogleGenAI } from '@google/genai';

const KEY_STORAGE = 'vocalis_gemini_api_key';

export function getApiKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setApiKey(key: string) {
  try {
    if (key.trim()) localStorage.setItem(KEY_STORAGE, key.trim());
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* storan disekat — abaikan */
  }
  window.dispatchEvent(new Event('vocalis-key-changed'));
}

function client(): GoogleGenAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Kunci API Gemini belum ditetapkan. Klik butang "Kunci API" di bahagian atas dan tampal kunci anda.');
  }
  return new GoogleGenAI({ apiKey });
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Tukar PCM 16-bit 24kHz mentah kepada bekas WAV standard
function pcmToWav(pcm: Uint8Array, sampleRate = 24000, numChannels = 1, bitDepth = 16): Uint8Array {
  if (pcm.length >= 12 && String.fromCharCode(pcm[0], pcm[1], pcm[2], pcm[3]) === 'RIFF') {
    return pcm;
  }
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const buf = new ArrayBuffer(44 + pcm.length);
  const v = new DataView(buf);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  v.setUint32(4, 36 + pcm.length, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, numChannels, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, byteRate, true);
  v.setUint16(32, blockAlign, true);
  v.setUint16(34, bitDepth, true);
  writeStr(36, 'data');
  v.setUint32(40, pcm.length, true);
  const out = new Uint8Array(buf);
  out.set(pcm, 44);
  return out;
}

function bytesToDataUrl(bytes: Uint8Array): string {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:audio/wav;base64,${btoa(bin)}`;
}

function toAudioResult(response: any) {
  const candidate = response.candidates?.[0];
  const part = candidate?.content?.parts?.find((p: any) => p?.inlineData?.data);
  const rawData = part?.inlineData?.data;
  if (!rawData) {
    throw new Error(`Model tidak mengembalikan data audio (${candidate?.finishReason || 'tiada sebab'}).`);
  }
  const pcm = base64ToBytes(rawData);
  const wav = pcmToWav(pcm);
  return {
    audioUrl: bytesToDataUrl(wav),
    duration: Number((pcm.length / 48000).toFixed(2)),
  };
}

function friendlyError(err: any): Error {
  const msg = String(err?.message || err);
  if (/API key not valid|API_KEY_INVALID/i.test(msg)) return new Error('Kunci API Gemini tidak sah. Semak semula kunci anda.');
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) return new Error('Had kuota Gemini dicapai. Cuba lagi sebentar atau guna kunci lain.');
  return err instanceof Error ? err : new Error(msg);
}

export async function generateSingle(opts: {
  text: string;
  voice: string;
  model: string;
  style?: string;
  accent?: string;
}) {
  const { text, voice, model, style, accent } = opts;
  let accentDirective =
    'Authentic native Bahasa Melayu speaker from Malaysia (sebutan baku Malaysia), clear natural rhythm, fluent pronunciation.';
  if (accent === 'malay-santai') {
    accentDirective = 'Native Malaysian Malay speaker in casual friendly everyday conversation, relaxed Malaysian colloquial rhythm, cheerful tone.';
  } else if (accent === 'malay-berita') {
    accentDirective = 'Formal Malaysian news broadcast announcer (Buletin Utama TV3 / Berita RTM), authoritative, crisp standard Bahasa Melayu pronunciation.';
  } else if (accent === 'malay-kl') {
    accentDirective = 'Modern urban Kuala Lumpur Malaysian youth accent, natural contemporary Bahasa Melayu speech.';
  }
  const resolvedStyle = style ? `${accentDirective} ${style}` : accentDirective;
  const selectedModel = model === 'gemini-3.8-flash-tts' ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';

  try {
    const response = await client().models.generateContent({
      model: selectedModel,
      contents: [{ role: 'user', parts: [{ text: text.trim(), speechMetadata: { style: resolvedStyle } } as any] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    });
    return toAudioResult(response);
  } catch (err) {
    throw friendlyError(err);
  }
}

export async function generateDialogue(opts: {
  turns: { speaker: string; text: string; style?: string }[];
  speaker1: { name: string; voice: string; style?: string };
  speaker2: { name: string; voice: string; style?: string };
}) {
  const { turns, speaker1, speaker2 } = opts;
  const parts = turns.map((turn) => {
    const defaultStyle = turn.speaker === speaker1.name ? speaker1.style : speaker2.style;
    return {
      text: `${turn.speaker}: ${turn.text}`,
      speechMetadata: {
        speaker: turn.speaker,
        style: `Authentic native Malaysian Malay speaker, ${turn.style || defaultStyle || 'natural everyday spoken Bahasa Melayu'}`,
      },
    } as any;
  });

  try {
    const response = await client().models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [{ role: 'user', parts }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              { speaker: speaker1.name, voiceConfig: { prebuiltVoiceConfig: { voiceName: speaker1.voice } } },
              { speaker: speaker2.name, voiceConfig: { prebuiltVoiceConfig: { voiceName: speaker2.voice } } },
            ],
          },
        },
      },
    });
    return toAudioResult(response);
  } catch (err) {
    throw friendlyError(err);
  }
}

export async function enhanceText(text: string, action: 'polish' | 'translate' | 'add_bursts'): Promise<string> {
  let prompt = '';
  if (action === 'polish') {
    prompt = `Anda ialah pakar skrip alih suara (voiceover) profesional Bahasa Melayu Malaysia.
Tugas anda ialah menyunting dan melancarkan teks berikut supaya berbunyi sangat asli, sedap didengar, dan natural apabila dibacakan oleh Text-to-Speech loghat orang Melayu Malaysia.
Pastikan:
- Gunakan kosa kata dan struktur tatabahasa lisan Bahasa Melayu Malaysia.
- Letakkan koma atau tanda baca di tempat jeda nafas yang sesuai.
- Kekalkan maksud asal.
- Balas HANYA dengan teks skrip yang telah diperelokkan tanpa mukadimah atau penerangan.

Teks asal:
"""${text}"""`;
  } else if (action === 'add_bursts') {
    prompt = `Anda ialah pengarah audio bagi dialog Bahasa Melayu Malaysia.
Teks ini akan dibaca oleh model TTS Gemini.
Model ini menyokong tag vokal khas:
- Backchanneling: |yeah|, |mhm|, |wah|
- Efek vokal: <laugh>, <gasp>, <breath>, <sigh>
Sisipkan 2-3 tag vokal yang sesuai dan natural mengikut gaya pertuturan orang Melayu Malaysia.
Balas HANYA teks yang telah disisipkan tag tersebut.

Teks asal:
"""${text}"""`;
  } else {
    prompt = `Terjemahkan teks berikut ke dalam Bahasa Melayu Malaysia yang sangat lancar, sedap didengar, dan natural untuk bacaan alih suara (voiceover).
Balas HANYA dengan teks hasil terjemahan.

Teks asal:
"""${text}"""`;
  }

  try {
    const response = await client().models.generateContent({ model: 'gemini-3.8-flash', contents: prompt });
    return response.text?.trim() || text;
  } catch (err) {
    throw friendlyError(err);
  }
}
