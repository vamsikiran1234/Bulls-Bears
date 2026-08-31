import { create } from 'zustand';
import { soundEngine } from '../services/audio';

interface SoundState {
  soundEnabled: boolean;
  volume: number;
  toggleSound: () => void;
  setVolume: (vol: number) => void;
}

export const useSoundStore = create<SoundState>((set, get) => ({
  soundEnabled: localStorage.getItem('bulls_bears_sound') !== 'false',
  volume: Number(localStorage.getItem('bulls_bears_vol') || '0.4'),

  toggleSound: () => {
    const next = !get().soundEnabled;
    localStorage.setItem('bulls_bears_sound', String(next));
    soundEngine.setEnabled(next);
    set({ soundEnabled: next });
  },

  setVolume: (vol) => {
    localStorage.setItem('bulls_bears_vol', String(vol));
    soundEngine.setVolume(vol);
    set({ volume: vol });
  },
}));
