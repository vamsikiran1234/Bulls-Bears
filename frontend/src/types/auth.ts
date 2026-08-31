export interface User {
  id: string;
  username: string;
  email: string;
  display_name?: string | null;
  avatar_seed: string;
  rank_title: string;
  total_score: number;
  games_played: number;
  games_won: number;
  current_streak: number;
  max_streak: number;
  best_score: number;
  fastest_win_seconds: number;
  win_rate: number;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface GuestGameItem {
  mode: string;
  status: string;
  attempts_used: number;
  time_elapsed_seconds: number;
  final_score: number;
  total_bulls: number;
  total_bears: number;
  completed_at?: string;
}
