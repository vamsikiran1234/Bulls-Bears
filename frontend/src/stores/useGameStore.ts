import { create } from 'zustand';
import confetti from 'canvas-confetti';
import api from '../services/api';
import type { GameSession, GameMode, GuessMove } from '../types/game';
import { soundEngine } from '../services/audio';
import { useAuthStore } from './useAuthStore';

interface GameState {
  session: GameSession | null;
  currentGuess: string;
  errorMessage: string | null;
  isSubmitting: boolean;
  isRevealing: boolean;
  activeMode: GameMode;
  timeRemaining: number;
  timerActive: boolean;

  // Modals
  isGameOverModalOpen: boolean;
  isRulesModalOpen: boolean;
  isGuestSyncModalOpen: boolean;

  // Actions
  setMode: (mode: GameMode) => void;
  startNewGame: (mode?: GameMode) => Promise<void>;
  resumeDailyGame: () => Promise<void>;
  addLetter: (char: string) => void;
  removeLetter: () => void;
  submitGuess: () => Promise<void>;
  abandonGame: () => Promise<void>;
  tickTimer: () => void;
  setGameOverModalOpen: (open: boolean) => void;
  setRulesModalOpen: (open: boolean) => void;
  setGuestSyncModalOpen: (open: boolean) => void;
  clearError: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  session: null,
  currentGuess: '',
  errorMessage: null,
  isSubmitting: false,
  isRevealing: false,
  activeMode: 'classic',
  timeRemaining: 120,
  timerActive: false,

  isGameOverModalOpen: false,
  isRulesModalOpen: false,
  isGuestSyncModalOpen: false,

  setMode: (mode) => set({ activeMode: mode }),

  startNewGame: async (mode) => {
    const selectedMode = mode || get().activeMode;
    set({ isSubmitting: true, errorMessage: null, currentGuess: '', isGameOverModalOpen: false });

    try {
      const url = selectedMode === 'daily' ? '/games/daily/today' : '/games/new';
      const payload = selectedMode === 'daily' ? {} : { mode: selectedMode };
      const res = await (selectedMode === 'daily'
        ? api.get<GameSession>(url)
        : api.post<GameSession>(url, payload));

      const session = res.data;
      const initialTime = Math.max(0, session.time_limit_seconds - session.time_elapsed_seconds);

      set({
        session,
        activeMode: selectedMode,
        timeRemaining: initialTime,
        timerActive: session.status === 'in_progress' && session.mode !== 'zen',
        isSubmitting: false,
        isRevealing: false,
      });
    } catch (err: any) {
      set({
        isSubmitting: false,
        errorMessage: err.response?.data?.detail || 'Failed to start game.',
      });
    }
  },

  resumeDailyGame: async () => {
    await get().startNewGame('daily');
  },

  addLetter: (char) => {
    const { session, currentGuess, isRevealing, isSubmitting } = get();
    if (!session || session.status !== 'in_progress' || isRevealing || isSubmitting) return;

    const cleaned = char.toUpperCase();
    if (/^[A-Z]$/.test(cleaned) && currentGuess.length < 5) {
      soundEngine.playKey();
      set({ currentGuess: currentGuess + cleaned, errorMessage: null });
    }
  },

  removeLetter: () => {
    const { session, currentGuess, isRevealing, isSubmitting } = get();
    if (!session || session.status !== 'in_progress' || isRevealing || isSubmitting) return;

    if (currentGuess.length > 0) {
      soundEngine.playKey();
      set({ currentGuess: currentGuess.slice(0, -1), errorMessage: null });
    }
  },

  submitGuess: async () => {
    const { session, currentGuess, isRevealing, isSubmitting, timeRemaining } = get();
    if (!session || session.status !== 'in_progress' || isRevealing || isSubmitting) return;

    if (currentGuess.length !== 5) {
      soundEngine.playError();
      set({ errorMessage: 'Word must be 5 letters.' });
      return;
    }

    set({ isSubmitting: true, errorMessage: null });

    try {
      const secondsTaken = Math.max(1, session.time_limit_seconds - timeRemaining - session.time_elapsed_seconds);
      const res = await api.post<GameSession>(`/games/${session.id}/guess`, {
        guess: currentGuess,
        seconds_taken: secondsTaken,
      });

      const updatedSession = res.data;
      const latestMove: GuessMove | undefined = updatedSession.moves[updatedSession.moves.length - 1];

      // Start sequential tile reveal animation
      set({ isRevealing: true });

      if (latestMove) {
        latestMove.feedback.forEach((fb, i) => {
          setTimeout(() => {
            if (fb.status === 'BULL') soundEngine.playBull();
            else if (fb.status === 'BEAR') soundEngine.playBear();
            else soundEngine.playMiss();
          }, (i + 1) * 300);
        });
      }

      // Conclude reveal animation after all 5 letters flip
      setTimeout(() => {
        set({
          session: updatedSession,
          currentGuess: '',
          isRevealing: false,
          isSubmitting: false,
        });

        // Check if game completed
        if (updatedSession.status === 'won') {
          soundEngine.playWinFanfare();
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24', '#ffffff'],
          });
          set({ timerActive: false, isGameOverModalOpen: true });

          // Record for guest if not logged in
          const authUser = useAuthStore.getState().user;
          if (!authUser) {
            useAuthStore.getState().recordGuestGame({
              mode: updatedSession.mode,
              status: 'won',
              attempts_used: updatedSession.attempts_used,
              time_elapsed_seconds: updatedSession.time_elapsed_seconds,
              final_score: updatedSession.final_score,
              total_bulls: 5,
              total_bears: 0,
            });
          }
        } else if (updatedSession.status === 'lost') {
          soundEngine.playDefeat();
          set({ timerActive: false, isGameOverModalOpen: true });

          const authUser = useAuthStore.getState().user;
          if (!authUser) {
            useAuthStore.getState().recordGuestGame({
              mode: updatedSession.mode,
              status: 'lost',
              attempts_used: updatedSession.attempts_used,
              time_elapsed_seconds: updatedSession.time_elapsed_seconds,
              final_score: updatedSession.final_score,
              total_bulls: updatedSession.total_bulls_found || 0,
              total_bears: updatedSession.total_bears_found || 0,
            });
          }
        }
      }, 1600);
    } catch (err: any) {
      soundEngine.playError();
      set({
        isSubmitting: false,
        isRevealing: false,
        errorMessage: err.response?.data?.detail || 'Invalid guess submission.',
      });
    }
  },

  abandonGame: async () => {
    const { session } = get();
    if (!session || session.status !== 'in_progress') return;

    try {
      const res = await api.post<GameSession>(`/games/${session.id}/abandon`);
      set({ session: res.data, timerActive: false, isGameOverModalOpen: true });
    } catch (err: any) {
      set({ errorMessage: err.response?.data?.detail || 'Failed to abandon game.' });
    }
  },

  tickTimer: () => {
    const { session, timeRemaining, timerActive } = get();
    if (!timerActive || !session || session.status !== 'in_progress') return;

    if (timeRemaining <= 1) {
      set({ timeRemaining: 0, timerActive: false });
      // Trigger abandon / timeout
      get().abandonGame();
    } else {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },

  setGameOverModalOpen: (open) => set({ isGameOverModalOpen: open }),
  setRulesModalOpen: (open) => set({ isRulesModalOpen: open }),
  setGuestSyncModalOpen: (open) => set({ isGuestSyncModalOpen: open }),
  clearError: () => set({ errorMessage: null }),
}));
