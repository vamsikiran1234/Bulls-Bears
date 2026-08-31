import { create } from 'zustand';

interface ThemeState {
  highContrast: boolean;
  toggleHighContrast: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  highContrast: localStorage.getItem('bulls_bears_high_contrast') === 'true',

  toggleHighContrast: () => {
    const next = !get().highContrast;
    localStorage.setItem('bulls_bears_high_contrast', String(next));
    set({ highContrast: next });
  },
}));
