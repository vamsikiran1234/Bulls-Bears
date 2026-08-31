export interface LeaderboardEntry {
  rank: number;
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
  best_score: number;
  fastest_win_seconds: number;
}

export interface LeaderboardResponse {
  period: string;
  mode: string;
  total_players: number;
  user_rank?: number | null;
  entries: LeaderboardEntry[];
}
