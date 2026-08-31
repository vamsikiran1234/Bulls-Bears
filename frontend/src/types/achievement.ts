export interface Achievement {
  code: string;
  title: string;
  description: string;
  icon_name: string;
  category: string;
  points: number;
  unlocked: boolean;
  unlocked_at?: string | null;
}
