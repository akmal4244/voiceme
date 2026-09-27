import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  Wand2,
  RotateCcw,
  Smile,
  Layers,
  Sliders,
  AlertCircle,
  Loader2,
  Zap,
  MapPin,
  Check,
} from 'lucide-react';
import { VoiceInfo, SavedSpeech } from '../types/tts.ts';
import { TEXT_PRESETS, STYLE_PRESETS, VOCAL_EFFECTS, ACCENT_PRESETS } from '../data/presets.ts';
import { VoiceSelector } from './VoiceSelector.tsx';

interface SingleSpeakerTabProps {
  voices: VoiceInfo[];
  onGenerateSuccess: (speech: SavedSpeech) => void;
}

export const SingleSpeakerTab: React.FC<SingleSpeakerTabProps> = ({
  voices,
  onGenerateSuccess,
}) => {
  const [text, setText] = useState(
    'Selamat sejahtera! <breath> Terima kasih kerana menggunakan sistem Text to Speech bahasa Melayu ini. Anda boleh taip sebarang teks dalam bahasa Melayu Malaysia dan tekan butang Jana Suara untuk dengar dan muat turun fail audio.'
  );
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [selectedAccent, setSelectedAccent] = useState('malay-standard');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts'>(
    'gemini-3.8-flash-lite-tts'
  );
  const [selectedStylePreset, setSelectedStylePreset] = useState('melayu-asli');
  const [customStyle, setCustomStyle] = useState('Native Malaysian Malay speaker, natural intonation, authentic Malaysian cadence and clear pronunciation');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pilih contoh teks pratetap
  const handleSelectPreset = (presetId: string) => {
    const found = TEXT_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setText(found.text);
      setSelectedVoice(found.recommendedVoice);
      setCustomStyle(found.recommendedStyle);
      setSelectedAccent(found.recommendedAccent || 'malay-standard');
      setSelectedStylePreset('kustom');
    }
  };

  // Pilih gaya pertuturan
  const handleSelectStyle = (presetId: string) => {
    setSelectedStylePreset(presetId);
    const found = STYLE_PRESETS.find((s) => s.id === presetId);
    if (found) {
      setCustomStyle(found.prompt);
    }
  };

  // Selitkan tag kesan vokal pada kedudukan kursor
  const handleInsertTag = (tag: string) => {
    setText((prev) => {
      const textarea = document.getElementById('single-speaker-textarea') as HTMLTextAreaElement | null;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = prev.substring(0, start);
        const after = prev.substring(end);
        return `${before} ${tag} ${after}`;
      }
      return `${prev} ${tag}`;
    });
  };

  // Suntingan AI untuk naskhah Bahasa Melayu
  const handleEnhance = async (action: 'polish' | 'translate' | 'add_bursts') => {
    if (!text.trim()) return;
    setIsEnhancing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tts/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses peningkatan teks.');
      }

      if (data.enhancedText) {
        setText(data.enhancedText);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menambah baik teks');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Hasilkan pertuturan audio (Generate Speech)
  const handleGenerate = async () => {
    if (!text.trim()) {
      setErrorMessage('Sila masukkan teks dalam Bahasa Melayu yang ingin disuarakan.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          model: selectedModel,
          style: customStyle,
          accent: selectedAccent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menjana suara audio.');
      }

      const newSpeech: SavedSpeech = {
        id: `speech-${Date.now()}`,
        timestamp: Date.now(),
        text,
        voice: selectedVoice,
        model: selectedModel,
        style: customStyle,
        accent: selectedAccent,
        audioUrl: data.audioUrl,
        duration: data.duration || 0,
        mode: 'single',
      };

      onGenerateSuccess(newSpeech);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ralat berlaku semasa menjana suara.');
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const estSeconds = Math.max(1, Math.round((wordCount / 130) * 60));

  return (
    <div className="space-y-6">
      {/* 1. Bahagian Ruang Teks */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <label
            htmlFor="single-speaker-textarea"
            className="text-sm font-semibold text-slate-200 flex items-center gap-2"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Tulis Teks Bahasa Melayu Anda Di Sini</span>
          </label>

          {/* Contoh teks pratetap */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Contoh Teks:</span>
            {TEXT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-slate-700/80 transition-colors cursor-pointer"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* Kotak Teks Input */}
        <div className="relative">
          <textarea
            id="single-speaker-textarea"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis apa sahaja ayat dalam Bahasa Melayu di sini (contoh: Selamat pagi Malaysia, jom makan nasi lemak bersama-sama)..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm leading-relaxed resize-y font-sans transition-all"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 mt-2 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span>{charCount} aksara</span>
              <span>•</span>
              <span>{wordCount} patah perkataan</span>
              <span>•</span>
              <span>Anggaran masa bacaan: ~{estSeconds} saat</span>
            </div>

            {text && (
              <button
                type="button"
                onClick={() => setText('')}
                className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Kosongkan Ruang</span>
              </button>
            )}
          </div>
        </div>

        {/* Bar Alatan Kesan Suara & Penala AI */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Sisipan Tag Vokal */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              <span>Selitkan Reaksi Suara:</span>
            </span>
            {VOCAL_EFFECTS.map((eff) => (
              <button
                key={eff.tag}
                type="button"
                onClick={() => handleInsertTag(eff.tag)}
                title={eff.desc}
                className="px-2 py-1 rounded-md text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              >
                {eff.tag}
              </button>
            ))}
          </div>

          {/* Bantuan AI Melayu */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isEnhancing || !text.trim()}
              onClick={() => handleEnhance('polish')}
              title="Perkemaskan tanda baca koma dan jeda nafas agar sedap didengar"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white border border-emerald-500/30 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isEnhancing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Lancar & Perelokkan Skrip Melayu</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Pemilihan Karakter Suara */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
        <VoiceSelector
          voices={voices}
          selectedVoiceId={selectedVoice}
          onSelectVoice={setSelectedVoice}
        />
      </div>

      {/* 3. Loghat & Gaya Pertuturan Orang Malaysia */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pilihan Loghat & Gaya Melayu */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Gaya Loghat & Sebutan Orang Melayu Malaysia</span>
            </label>
            <span className="text-xs text-slate-400">Intonasi Tempatan Malaysia</span>
          </div>

          {/* Kad Pilihan Loghat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ACCENT_PRESETS.map((acc) => {
              const isSelected = selectedAccent === acc.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccent(acc.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      {acc.name}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {acc.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Pratetap Gaya Intonasi Emosi */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 block font-medium">
              Pratetap Suasana & Emosi Suara:
            </span>
            <div className="flex flex-wrap gap-2">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => handleSelectStyle(style.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    selectedStylePreset === style.id
                      ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/60 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/70'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Arahan Gaya Bicara Kustom */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs text-slate-400">
              Arahan gaya pertuturan khusus (boleh tulis dalam Bahasa Melayu):
            </span>
            <input
              type="text"
              value={customStyle}
              onChange={(e) => {
                setCustomStyle(e.target.value);
                setSelectedStylePreset('kustom');
              }}
              placeholder="Contoh: Suara orang Melayu sangat mesra, nada santai macam berbual dengan kawan baik..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>

        {/* Pilihan Enjin Model TTS Google */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm space-y-4">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Pilihan Enjin Suara Google AI</span>
          </label>

          <div className="space-y-2.5">
            <div
              onClick={() => setSelectedModel('gemini-3.8-flash-lite-tts')}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                selectedModel === 'gemini-3.8-flash-lite-tts'
                  ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/40'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Flash-Lite TTS
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                  Pantas & Ringan
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Menjana suara dalam beberapa saat sahaja. Sangat cekap untuk bacaan artikel, mesej, dan hantaran media sosial.
              </p>
            </div>

            <div
              onClick={() => setSelectedModel('gemini-3.8-flash-tts')}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                selectedModel === 'gemini-3.8-flash-tts'
                  ? 'bg-teal-950/40 border-teal-500 text-white shadow-sm ring-1 ring-teal-500/40'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Flash TTS (Ketepatan Tinggi)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-medium">
                  Ekspresif
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Model audio tercanggih Google dengan emosi suara paling mendalam dan intonasi sebutan Melayu yang realistik.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Paparan mesej ralat jika ada */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      {/* 4. Butang Jana Suara Utama */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <button
          type="button"
          disabled={isLoading || !text.trim()}
          onClick={handleGenerate}
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:via-teal-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-emerald-600/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sedang Menjana Suara Melayu Google AI...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              <span>Jana Suara Melayu Sekarang</span>
            </>
          )}
        </button>
        <span className="text-xs text-slate-400">
          Selepas dijana, anda boleh terus dengar dan klik <b>Muat Turun WAV</b> untuk simpan fail audio ke telefon atau komputer anda.
        </span>
      </div>
    </div>
  );
};
