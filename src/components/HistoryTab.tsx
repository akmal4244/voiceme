import React from 'react';
import {
  History,
  Trash2,
  Download,
  Play,
  Calendar,
  Sparkles,
  Users,
  Mic2,
} from 'lucide-react';
import { SavedSpeech } from '../types/tts.ts';

interface HistoryTabProps {
  history: SavedSpeech[];
  onPlaySpeech: (speech: SavedSpeech) => void;
  onDeleteSpeech: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  history,
  onPlaySpeech,
  onDeleteSpeech,
  onClearHistory,
}) => {
  // Muat turun fail WAV dari sejarah
  const handleDownload = (speech: SavedSpeech) => {
    const link = document.createElement('a');
    link.href = speech.audioUrl;
    link.download = `suara-melayu-${speech.voice.toLowerCase().replace(/\s+/g, '-')}-${speech.timestamp}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString();
  };

  if (history.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center shadow-xl backdrop-blur-sm">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center mb-4 border border-emerald-500/20">
          <History className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Tiada Sejarah Audio Tersimpan</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Tulis teks dalam Bahasa Melayu di tab Suara Tunggal atau Dialog di atas, kemudian tekan <b>Jana Suara</b>. Semua audio yang anda cipta akan dipaparkan di sini dan boleh dimuat turun pada bila-bila masa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">
            Koleksi Audio Suara Melayu Anda ({history.length})
          </h3>
        </div>

        <button
          onClick={onClearHistory}
          className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Padam Semua Sejarah</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/90 rounded-2xl p-4 md:p-5 shadow-lg backdrop-blur-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.mode === 'dialogue' ? (
                    <>
                      <Users className="w-3 h-3 mr-1" />
                      Dialog
                    </>
                  ) : (
                    <>
                      <Mic2 className="w-3 h-3 mr-1" />
                      {item.voice}
                    </>
                  )}
                </span>

                <span className="text-slate-400 font-mono text-[11px]">
                  {item.duration > 0 ? `${item.duration} saat` : 'WAV'}
                </span>

                <span className="text-slate-500">•</span>

                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {formatDate(item.timestamp)}
                </span>
              </div>

              <p className="text-sm text-slate-200 line-clamp-2 font-sans leading-relaxed">
                "{item.text}"
              </p>

              {item.style && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                  <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">Gaya: {item.style}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => onPlaySpeech(item)}
                title="Dengar audio ini di pemain utama"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Mainkan</span>
              </button>

              <button
                onClick={() => handleDownload(item)}
                title="Muat Turun Fail WAV"
                className="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white bg-slate-800 hover:bg-emerald-900/40 transition-colors border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Muat Turun</span>
              </button>

              <button
                onClick={() => onDeleteSpeech(item.id)}
                title="Padam rekod ini"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
