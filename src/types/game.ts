export interface Picture {
  id: string;
  image_url: string;
  name: string;
  category: string;
  created_at: string;
}

export interface Room {
  id: string;
  room_code: string;
  status: 'waiting' | 'playing' | 'finished';
  winner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  player_name: string;
  picture_id: string | null;
  is_turn: boolean;
  connected: boolean;
  player_number: number;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  player_id: string | null;
  message_type: 'question' | 'answer' | 'guess' | 'system';
  content: string;
  created_at: string;
}

export interface GameState {
  room: Room | null;
  players: Player[];
  messages: Message[];
  pictures: Picture[];
  currentPlayerId: string | null;
}
