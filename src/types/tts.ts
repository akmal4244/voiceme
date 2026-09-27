export interface VoiceInfo {
  id: string;
  name: string;
  gender: 'Lelaki' | 'Wanita';
  tone: string;
  recommended: string;
  description: string;
}

export interface DialogueTurn {
  id: string;
  speaker: string;
  text: string;
  style?: string;
}

export interface SavedSpeech {
  id: string;
  timestamp: number;
  text: string;
  voice: string;
  model: string;
  style: string;
  accent?: string;
  audioUrl: string;
  duration: number;
  mode: 'single' | 'dialogue';
}
