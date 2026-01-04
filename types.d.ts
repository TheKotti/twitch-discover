export type SimpleGame = {
  id: number;
  name: string;
};

export type GameOption = SimpleGame & {
  release_dates: Array<{
    y: number;
    id: number;
  }>;
  url: string;
};

export type Stream = {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  tags: string[];
  viewer_count: number;
  started_at: string; // ISO 8601 timestamp
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
};
