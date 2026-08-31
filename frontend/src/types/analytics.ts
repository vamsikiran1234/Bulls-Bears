export interface GuessDistributionItem {
  attempt_number: number;
  count: number;
  percentage: number;
}

export interface ScoreHistoryItem {
  game_id: string;
  game_number: number;
  score: number;
  attempts: number;
  time_seconds: number;
  is_win: boolean;
  mode: string;
  date: string;
}

export interface GameReplayMove {
  move_number: number;
  guess_word: string;
  feedback: Array<{ index: number; letter: string; status: 'BULL' | 'BEAR' | 'MISS' }>;
  bulls_count: number;
  bears_count: number;
  seconds_taken: number;
}

export interface GameReplay {
  id: string;
  mode: string;
  target_word: string;
  status: string;
  final_score: number;
  attempts_used: number;
  time_elapsed_seconds: number;
  started_at: string;
  completed_at?: string | null;
  moves: GameReplayMove[];
}

export interface UserStatsAnalytics {
  user_id: string;
  username: string;
  display_name?: string | null;
  avatar_seed: string;
  rank_title: string;
  total_score: number;
  games_played: number;
  games_won: number;
  win_rate: number;
  current_streak: number;
  max_streak: number;
  best_score: number;
  average_score: number;
  average_solve_time: number;
  average_attempts: number;
  fastest_win_seconds: number;
  bull_accuracy_rate: number;
  bear_accuracy_rate: number;
  guess_distribution: GuessDistributionItem[];
  recent_history: ScoreHistoryItem[];
}
