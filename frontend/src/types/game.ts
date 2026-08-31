export type FeedbackStatus = 'BULL' | 'BEAR' | 'MISS';

export type GameMode = 'classic' | 'daily' | 'blitz' | 'zen';

export type GameStatus = 'in_progress' | 'won' | 'lost' | 'abandoned';

export interface LetterFeedback {
  index: number;
  letter: string;
  status: FeedbackStatus;
}

export interface GuessMove {
  id: string;
  move_number: number;
  guess_word: string;
  feedback: LetterFeedback[];
  bulls_count: number;
  bears_count: number;
  seconds_taken: number;
  created_at: string;
}

export interface ScoreBreakdown {
  base_points: number;
  attempt_bonus: number;
  time_bonus: number;
  accuracy_bonus: number;
  subtotal: number;
  streak_multiplier: number;
  total_score: number;
  is_win: boolean;
  description: string;
}

export interface GameSession {
  id: string;
  user_id?: string | null;
  mode: GameMode;
  daily_date?: string | null;
  status: GameStatus;
  attempts_used: number;
  max_attempts: number;
  time_limit_seconds: number;
  time_elapsed_seconds: number;
  final_score: number;
  score_breakdown?: ScoreBreakdown | null;
  target_word?: string | null;
  moves: GuessMove[];
  keyboard_status: Record<string, FeedbackStatus>;
  started_at: string;
  completed_at?: string | null;
}
