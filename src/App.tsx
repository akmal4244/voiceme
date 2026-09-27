import React, { useState, useEffect } from 'react';
import {
  Mic,
  Users,
  History,
  Sparkles,
  Info,
  Radio,
  Volume2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { VoiceInfo, SavedSpeech } from './types/tts.ts';
import { SingleSpeakerTab } from './components/SingleSpeakerTab.tsx';
import { DialogueTab } from './components/DialogueTab.tsx';
import { HistoryTab } from './components/HistoryTab.tsx';
import { AudioPlayer } from './components/AudioPlayer.tsx';

// Senarai suara asal Google AI dengan huraian Bahasa Melayu
const DEFAULT_VOICES: VoiceInfo[] = [
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

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'dialogue' | 'history'>('single');
  const [voices, setVoices] = useState<VoiceInfo[]>(DEFAULT_VOICES);
  const [currentSpeech, setCurrentSpeech] = useState<SavedSpeech | null>(null);
  const [history, setHistory] = useState<SavedSpeech[]>([]);
  const [showTips, setShowTips] = useState(false);

  // Ambil senarai suara dari pelayan
  useEffect(() => {
    fetch('/api/tts/voices')
      .then((res) => res.json())
      .then((data) => {
        if (data.voices && Array.isArray(data.voices)) {
          setVoices(data.voices);
        }
      })
      .catch((err) => console.log('Menggunakan suara lalai:', err));
  }, []);

  // Muat sejarah dari storan tempatan (localStorage)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vocalis_malay_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
          if (parsed.length > 0) {
            setCurrentSpeech(parsed[0]);
          }
        }
      }
    } catch (e) {
      console.error('Gagal memuatkan sejarah:', e);
    }
  }, []);

  // Simpan sejarah audio ke storan
  const saveHistoryToStorage = (items: SavedSpeech[]) => {
    setHistory(items);
    try {
      localStorage.setItem('vocalis_malay_history', JSON.stringify(items.slice(0, 30)));
    } catch (e) {
      console.warn('Had simpanan storan dicapai:', e);
    }
  };

  const handleGenerateSuccess = (newSpeech: SavedSpeech) => {
    setCurrentSpeech(newSpeech);
    const updated = [newSpeech, ...history.filter((h) => h.id !== newSpeech.id)];
    saveHistoryToStorage(updated);

    // Skrol ke bahagian atas pemain audio secara lancar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayFromHistory = (speech: SavedSpeech) => {
    setCurrentSpeech(speech);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    saveHistoryToStorage(updated);
    if (currentSpeech?.id === id) {
      setCurrentSpeech(updated[0] || null);
    }
  };

  const handleClearHistory = () => {
    saveHistoryToStorage([]);
    setCurrentSpeech(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Bentuk hiasan suasana latar belakang */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Bar Kepala (Header) */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-600/25">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">
                  Vocalis Malaysia
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30">
                  Suara Melayu Asli
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sistem Text to Speech Bahasa Melayu Malaysia (Enjin Google Gemini AI)
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Enjin Suara Melayu Aktif</span>
            </span>
          </div>
        </div>
      </header>

      {/* Ruang Kandungan Utama */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10 space-y-6">
        {/* Pemain Audio Aktif */}
        {currentSpeech && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Pemain Audio Suara Melayu</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">
                Klik butang Main atau Muat Turun WAV di bawah
              </span>
            </div>
            <AudioPlayer
              audioUrl={currentSpeech.audioUrl}
              duration={currentSpeech.duration}
              voiceName={currentSpeech.voice}
              title={
                currentSpeech.mode === 'dialogue'
                  ? 'Perbualan Dialog Bahasa Melayu Malaysia'
                  : `Suara: ${currentSpeech.voice} (${currentSpeech.model.includes('lite') ? 'Flash-Lite' : 'Flash High Fidelity'})`
              }
              text={currentSpeech.text}
            />
          </section>
        )}

        {/* Bar Navigasi Tab */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 shadow-md">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'single'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Suara Tunggal (Single Speaker)</span>
            </button>

            <button
              onClick={() => setActiveTab('dialogue')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'dialogue'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Dialog Podcast (Dua Suara)</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Sejarah & Muat Turun</span>
              {history.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-emerald-300 font-mono">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {/* Panduan Pintas */}
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-300 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Panduan Sebutan Suara Melayu</span>
            {showTips ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Kotak Panduan Runtuh */}
        {showTips && (
          <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/20 rounded-2xl p-5 shadow-lg text-xs leading-relaxed space-y-3">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Petua Untuk Hasil Suara Orang Melayu Malaysia Yang Semula Jadi:</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="font-semibold text-emerald-300 block mb-1">
                  1. Pilih Gaya Loghat Sesuai
                </span>
                Pilih antara <b>Baku Rasmi Malaysia</b> untuk ucapan rasmi dan berita, atau <b>Loghat Santai Harian</b> untuk perbualan biasa macam lepak sembang kedai kopi.
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="font-semibold text-teal-300 block mb-1">
                  2. Sisipkan Nafas & Tawa
                </span>
                Gunakan butang tag reaksi seperti <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">&lt;breath&gt;</code> untuk jeda nafas, <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">&lt;laugh&gt;</code> untuk ketawa, atau <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300">|yeah|</code> untuk nada setuju.
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="font-semibold text-cyan-300 block mb-1">
                  3. Muat Turun Fail Audio
                </span>
                Setiap audio yang dijana boleh terus dimuat turun dalam bentuk fail format <b>.wav berkualiti tinggi 24,000 Hz</b> tanpa had dan tanpa bayaran.
              </div>
            </div>
          </div>
        )}

        {/* Paparan Kandungan Mengikut Tab */}
        {activeTab === 'single' && (
          <SingleSpeakerTab
            voices={voices}
            onGenerateSuccess={handleGenerateSuccess}
          />
        )}

        {activeTab === 'dialogue' && (
          <DialogueTab
            voices={voices}
            onGenerateSuccess={handleGenerateSuccess}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            history={history}
            onPlaySpeech={handlePlayFromHistory}
            onDeleteSpeech={handleDeleteHistory}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Kaki Halaman (Footer) */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-400">Vocalis Malaysia Studio</span>
            <span>• Dikuasakan oleh Google Gemini AI Audio</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Audio 24,000 Hz Jernih</span>
            <span>•</span>
            <span>Format WAV Muat Turun Terus</span>
            <span>•</span>
            <span>Bahasa Melayu Malaysia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
