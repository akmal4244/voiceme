import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  ArrowRightLeft,
  Volume2,
  AlertCircle,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { VoiceInfo, SavedSpeech, DialogueTurn } from '../types/tts.ts';
import { DIALOGUE_PRESETS, VOCAL_EFFECTS } from '../data/presets.ts';
import { generateDialogue } from '../lib/gemini.ts';

interface DialogueTabProps {
  voices: VoiceInfo[];
  onGenerateSuccess: (speech: SavedSpeech) => void;
}

export const DialogueTab: React.FC<DialogueTabProps> = ({
  voices,
  onGenerateSuccess,
}) => {
  const [speaker1, setSpeaker1] = useState({
    name: 'Danial',
    voice: 'Puck',
    style: 'Pemuda Malaysia yang ceria, bertenaga, perbualan santai',
  });

  const [speaker2, setSpeaker2] = useState({
    name: 'Aisyah',
    voice: 'Kore',
    style: 'Gadis Melayu sopan, lemah lembut, dan bijak',
  });

  const [turns, setTurns] = useState<DialogueTurn[]>([
    {
      id: 'turn-1',
      speaker: 'Danial',
      text: 'Hai assalamualaikum semua! <breath> Selamat kembali ke Podcast Sembang Santai Malaysia.',
      style: 'Ceria dan ramah menegur pendengar',
    },
    {
      id: 'turn-2',
      speaker: 'Aisyah',
      text: 'Waalaikumussalam Danial! Seronok dapat bersama-sama hari ini. Topik suara kecerdasan buatan memang sangat menarik.',
      style: 'Lemah lembut dan tersenyum',
    },
    {
      id: 'turn-3',
      speaker: 'Danial',
      text: 'Betul tu! Sekarang sistem Text to Speech dah pandai sebut intonasi orang Melayu kita dengan sangat lancar kan?',
      style: 'Bertenaga dan kagum',
    },
    {
      id: 'turn-4',
      speaker: 'Aisyah',
      text: 'Ya, tepat sekali! |yeah| Dengar seperti perbualan biasa dua orang kawan di kedai kopi.',
      style: 'Sopan dan bersetuju',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Muat pratetap dialog
  const handleLoadPreset = (presetId: string) => {
    const found = DIALOGUE_PRESETS.find((p) => p.id === presetId);
    if (!found) return;

    setSpeaker1({
      name: found.speaker1.name,
      voice: found.speaker1.voice,
      style: found.speaker1.style,
    });

    setSpeaker2({
      name: found.speaker2.name,
      voice: found.speaker2.voice,
      style: found.speaker2.style,
    });

    setTurns(
      found.turns.map((t, idx) => ({
        id: `turn-preset-${idx}-${Date.now()}`,
        speaker: t.speaker,
        text: t.text,
      }))
    );
  };

  // Tambah baris giliran bercakap
  const handleAddTurn = (preferredSpeaker?: string) => {
    const lastTurn = turns[turns.length - 1];
    const nextSpeaker = preferredSpeaker
      ? preferredSpeaker
      : lastTurn?.speaker === speaker1.name
      ? speaker2.name
      : speaker1.name;

    const newTurn: DialogueTurn = {
      id: `turn-${Date.now()}`,
      speaker: nextSpeaker,
      text: '',
    };
    setTurns([...turns, newTurn]);
  };

  // Padam baris dialog
  const handleRemoveTurn = (id: string) => {
    if (turns.length <= 1) return;
    setTurns(turns.filter((t) => t.id !== id));
  };

  // Kemas kini teks dialog
  const handleUpdateText = (id: string, text: string) => {
    setTurns(turns.map((t) => (t.id === id ? { ...t, text } : t)));
  };

  // Tukar watak pembicara
  const handleToggleSpeaker = (id: string) => {
    setTurns(
      turns.map((t) => {
        if (t.id === id) {
          const nextSpk = t.speaker === speaker1.name ? speaker2.name : speaker1.name;
          return { ...t, speaker: nextSpk };
        }
        return t;
      })
    );
  };

  // Selitkan kesan suara ke dalam baris dialog
  const handleInsertTag = (turnId: string, tag: string) => {
    setTurns(
      turns.map((t) => {
        if (t.id === turnId) {
          return { ...t, text: `${t.text} ${tag}`.trim() };
        }
        return t;
      })
    );
  };

  // Jana dialog suara berganda
  const handleGenerateDialogue = async () => {
    const emptyTurn = turns.find((t) => !t.text.trim());
    if (emptyTurn) {
      setErrorMessage('Semua baris dialog mesti mempunyai teks ucapan.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await generateDialogue({
        turns: turns.map((t) => ({
          speaker: t.speaker,
          text: t.text,
          style: t.style,
        })),
        speaker1,
        speaker2,
      });

      const combinedText = turns
        .map((t) => `[${t.speaker}]: ${t.text}`)
        .join('\n');

      const newSpeech: SavedSpeech = {
        id: `dialogue-${Date.now()}`,
        timestamp: Date.now(),
        text: combinedText,
        voice: `${speaker1.name} (${speaker1.voice}) & ${speaker2.name} (${speaker2.voice})`,
        model: 'gemini-3.8-flash-tts',
        style: 'Dialog Dua Pembicara Bahasa Melayu Malaysia',
        audioUrl: data.audioUrl,
        duration: data.duration || 0,
        mode: 'dialogue',
      };

      onGenerateSuccess(newSpeech);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ralat berlaku semasa memproses dialog.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Tetapan Dua Watak Pembicara */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pembicara 1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-sm font-bold text-white">Pembicara 1 (Lelaki / Utama)</h4>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Karakter 1
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nama Watak</label>
              <input
                type="text"
                value={speaker1.name}
                onChange={(e) => setSpeaker1({ ...speaker1, name: e.target.value })}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Pilihan Suara Google</label>
              <select
                value={speaker1.voice}
                onChange={(e) => setSpeaker1({ ...speaker1, voice: e.target.value })}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gender}) - {v.tone.split(',')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Gaya Pertuturan Pembicara 1</label>
            <input
              type="text"
              value={speaker1.style}
              onChange={(e) => setSpeaker1({ ...speaker1, style: e.target.value })}
              placeholder="Contoh: Ramah, santai, ceria macam hos podcast..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Pembicara 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
              <h4 className="text-sm font-bold text-white">Pembicara 2 (Wanita / Rakan)</h4>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Karakter 2
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nama Watak</label>
              <input
                type="text"
                value={speaker2.name}
                onChange={(e) => setSpeaker2({ ...speaker2, name: e.target.value })}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Pilihan Suara Google</label>
              <select
                value={speaker2.voice}
                onChange={(e) => setSpeaker2({ ...speaker2, voice: e.target.value })}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gender}) - {v.tone.split(',')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Gaya Pertuturan Pembicara 2</label>
            <input
              type="text"
              value={speaker2.style}
              onChange={(e) => setSpeaker2({ ...speaker2, style: e.target.value })}
              placeholder="Contoh: Sopan, lemah lembut, intonasi tenang..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Ruang Skrip Perbualan Mengikut Giliran */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Skrip Giliran Berbual (Bahasa Melayu)</h4>
          </div>

          {/* Contoh Pratetap Dialog */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Contoh Dialog:</span>
            {DIALOGUE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* Senarai Giliran Dialog */}
        <div className="space-y-3.5">
          {turns.map((turn, index) => {
            const isSpk1 = turn.speaker === speaker1.name;
            return (
              <div
                key={turn.id}
                className={`p-4 rounded-xl border transition-all ${
                  isSpk1
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-teal-950/20 border-teal-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isSpk1
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      }`}
                    >
                      {turn.speaker} (Giliran #{index + 1})
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleSpeaker(turn.id)}
                      title="Tukar Watak Pembicara"
                      className="text-xs text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span className="text-[10px]">Tukar</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Cip Kesan Suara Pantas */}
                    <div className="hidden sm:flex items-center gap-1">
                      {VOCAL_EFFECTS.slice(0, 4).map((eff) => (
                        <button
                          key={eff.tag}
                          type="button"
                          onClick={() => handleInsertTag(turn.id, eff.tag)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        >
                          {eff.tag}
                        </button>
                      ))}
                    </div>

                    {turns.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTurn(turn.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Padam Baris Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={turn.text}
                  onChange={(e) => handleUpdateText(turn.id, e.target.value)}
                  placeholder={`Tulis dialog yang diucapkan oleh ${turn.speaker} dalam Bahasa Melayu...`}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none font-sans"
                />
              </div>
            );
          })}
        </div>

        {/* Butang Tambah Giliran */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => handleAddTurn(speaker1.name)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Giliran ({speaker1.name})</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddTurn(speaker2.name)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-teal-950/50 text-teal-300 border border-teal-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Giliran ({speaker2.name})</span>
          </button>
        </div>
      </div>

      {/* Ralat jika ada */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      {/* Butang Jana Dialog Lengkap */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleGenerateDialogue}
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:via-teal-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-emerald-600/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sedang Menjana Dialog Dua Suara Melayu...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              <span>Jana Dialog Dua Suara Lengkap</span>
            </>
          )}
        </button>
        <span className="text-xs text-slate-400">
          Menggunakan model Google Gemini 3.8 Flash TTS untuk cantuman dua watak suara berbeza dalam satu fail WAV.
        </span>
      </div>
    </div>
  );
};
