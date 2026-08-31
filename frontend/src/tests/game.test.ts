import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../stores/useGameStore';

describe('Game Store unit tests', () => {
  beforeEach(() => {
    useGameStore.setState({
      session: {
        id: 'test-session-1',
        user_id: null,
        mode: 'classic',
        status: 'in_progress',
        attempts_used: 0,
        max_attempts: 6,
        time_limit_seconds: 120,
        time_elapsed_seconds: 0,
        final_score: 0,
        moves: [],
        keyboard_status: {},
        started_at: new Date().toISOString(),
      },
      currentGuess: '',
      errorMessage: null,
      isSubmitting: false,
      isRevealing: false,
      timeRemaining: 120,
      timerActive: true,
    });
  });

  it('adds uppercase letters up to 5 characters', () => {
    const store = useGameStore.getState();
    store.addLetter('t');
    store.addLetter('R');
    store.addLetter('a');
    store.addLetter('d');
    store.addLetter('e');
    store.addLetter('s'); // 6th letter should be ignored

    expect(useGameStore.getState().currentGuess).toBe('TRADE');
  });

  it('removes letters on backspace', () => {
    const store = useGameStore.getState();
    store.addLetter('B');
    store.addLetter('U');
    store.addLetter('L');
    store.removeLetter();

    expect(useGameStore.getState().currentGuess).toBe('BU');
  });

  it('resets error message when typing new letter', () => {
    useGameStore.setState({ errorMessage: 'Invalid word' });
    const store = useGameStore.getState();
    store.addLetter('A');

    expect(useGameStore.getState().errorMessage).toBeNull();
  });

  it('switches game modes properly', () => {
    const store = useGameStore.getState();
    store.setMode('blitz');
    expect(useGameStore.getState().activeMode).toBe('blitz');

    store.setMode('daily');
    expect(useGameStore.getState().activeMode).toBe('daily');
  });
});
