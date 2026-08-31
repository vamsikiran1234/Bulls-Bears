import { create } from 'zustand';
import api from '../services/api';
import type { User, TokenResponse, GuestGameItem } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  guestGames: GuestGameItem[];
  
  // Actions
  initializeAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName?: string, avatarSeed?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (displayName?: string, avatarSeed?: string) => Promise<void>;
  recordGuestGame: (game: GuestGameItem) => void;
  syncGuestGames: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('bulls_bears_token'),
  isLoading: true,
  guestGames: JSON.parse(localStorage.getItem('bulls_bears_guest_games') || '[]'),

  initializeAuth: async () => {
    const token = localStorage.getItem('bulls_bears_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const res = await api.get<User>('/auth/me');
      set({ user: res.data, isLoading: false });
      // If guest games exist, trigger automatic sync
      const guestGames = get().guestGames;
      if (guestGames.length > 0) {
        await get().syncGuestGames();
      }
    } catch {
      localStorage.removeItem('bulls_bears_token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post<TokenResponse>('/auth/login', { username, password });
      localStorage.setItem('bulls_bears_token', res.data.access_token);
      set({ user: res.data.user, token: res.data.access_token, isLoading: false });

      // Sync guest games if any
      const guestGames = get().guestGames;
      if (guestGames.length > 0) {
        await get().syncGuestGames();
      }
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (username, email, password, displayName, avatarSeed) => {
    set({ isLoading: true });
    try {
      const res = await api.post<TokenResponse>('/auth/register', {
        username,
        email,
        password,
        display_name: displayName,
        avatar_seed: avatarSeed || 'bull-1',
      });
      localStorage.setItem('bulls_bears_token', res.data.access_token);
      set({ user: res.data.user, token: res.data.access_token, isLoading: false });

      // Sync guest games
      const guestGames = get().guestGames;
      if (guestGames.length > 0) {
        await get().syncGuestGames();
      }
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('bulls_bears_token');
    set({ user: null, token: null });
  },

  updateProfile: async (displayName, avatarSeed) => {
    const res = await api.patch<User>('/auth/profile', {
      display_name: displayName,
      avatar_seed: avatarSeed,
    });
    set({ user: res.data });
  },

  recordGuestGame: (game) => {
    const updated = [...get().guestGames, game];
    localStorage.setItem('bulls_bears_guest_games', JSON.stringify(updated));
    set({ guestGames: updated });
  },

  syncGuestGames: async () => {
    const games = get().guestGames;
    if (games.length === 0 || !get().user) return;

    try {
      const res = await api.post<User>('/auth/guest-sync', { guest_games: games });
      localStorage.removeItem('bulls_bears_guest_games');
      set({ user: res.data, guestGames: [] });
    } catch (err) {
      console.error('Failed to sync guest stats:', err);
    }
  },

  setUser: (user) => set({ user }),
}));
