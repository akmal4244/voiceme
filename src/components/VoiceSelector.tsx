import React from 'react';
import { Check, Mic2 } from 'lucide-react';
import { VoiceInfo } from '../types/tts.ts';

interface VoiceSelectorProps {
  voices: VoiceInfo[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  compact?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
  compact = false,
}) => {
  const getAvatarGradient = (voiceId: string) => {
    switch (voiceId) {
      case 'Kore':
        return 'from-rose-500 to-indigo-600';
      case 'Puck':
        return 'from-amber-500 to-orange-600';
      case 'Fenrir':
        return 'from-emerald-500 to-teal-700';
      case 'Charon':
        return 'from-purple-600 to-slate-800';
      case 'Zephyr':
        return 'from-cyan-500 to-blue-600';
      default:
        return 'from-indigo-500 to-purple-600';
    }
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {voices.map((voice) => {
          const isSelected = selectedVoiceId === voice.id;
          return (
            <button
              key={voice.id}
              type="button"
              onClick={() => onSelectVoice(voice.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getAvatarGradient(
                  voice.id
                )} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow`}
              >
                {voice.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate flex items-center justify-between">
                  <span>{voice.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {voice.gender} • {voice.tone.split(',')[0]}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Mic2 className="w-4 h-4 text-indigo-400" />
          <span>Watak Suara Google AI (Bahasa Melayu)</span>
        </label>
        <span className="text-xs text-slate-400">
          5 Pilihan Suara Asli Tersedia
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {voices.map((voice) => {
          const isSelected = selectedVoiceId === voice.id;
          return (
            <div
              key={voice.id}
              onClick={() => onSelectVoice(voice.id)}
              className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/30'
                  : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                      voice.id
                    )} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform`}
                  >
                    {voice.name[0]}
                  </div>
                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {voice.gender}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {voice.name}
                </h4>

                <p className="text-xs text-indigo-300/90 font-medium mt-0.5 line-clamp-1">
                  {voice.tone}
                </p>

                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                  {voice.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/70">
                <span className="text-[10px] text-slate-400 font-medium block truncate">
                  Sesuai: {voice.recommended.split(',')[0]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
