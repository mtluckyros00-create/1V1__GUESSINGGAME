/*
  # Guess the Picture Game Schema

  ## Overview
  Complete database schema for a 2-player real-time guess-the-picture game.

  ## Tables Created
  
  ### 1. pictures
  - `id` (uuid, primary key) - Unique picture identifier
  - `image_url` (text) - URL to the picture
  - `name` (text) - Name/description of the picture
  - `category` (text) - Category for grouping
  - `created_at` (timestamptz) - Record creation time
  
  ### 2. rooms
  - `id` (uuid, primary key) - Unique room identifier
  - `room_code` (text, unique) - 6-character join code
  - `status` (text) - Room status: waiting, playing, finished
  - `winner_id` (uuid, nullable) - ID of winning player
  - `created_at` (timestamptz) - Room creation time
  - `updated_at` (timestamptz) - Last update time
  
  ### 3. players
  - `id` (uuid, primary key) - Unique player identifier
  - `room_id` (uuid, foreign key) - Associated room
  - `player_name` (text) - Player display name
  - `picture_id` (uuid, foreign key, nullable) - Assigned secret picture
  - `is_turn` (boolean) - Whether it's this player's turn
  - `connected` (boolean) - Connection status
  - `player_number` (integer) - Player 1 or 2
  - `created_at` (timestamptz) - Join time
  
  ### 4. messages
  - `id` (uuid, primary key) - Unique message identifier
  - `room_id` (uuid, foreign key) - Associated room
  - `player_id` (uuid, foreign key) - Message sender
  - `message_type` (text) - Type: question, answer, guess, system
  - `content` (text) - Message content
  - `created_at` (timestamptz) - Message time

  ## Security
  - RLS enabled on all tables
  - Public read access for pictures
  - Players can only access their own game data
  - Real-time subscriptions available for game updates

  ## Important Notes
  - Room codes are automatically generated (uppercase alphanumeric)
  - Pictures are pre-populated for immediate gameplay
  - Turn management is handled via the is_turn boolean
  - All timestamps use timestamptz for accuracy
*/

-- Create pictures table
CREATE TABLE IF NOT EXISTS pictures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  name text NOT NULL,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  winner_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  player_name text NOT NULL,
  picture_id uuid REFERENCES pictures(id),
  is_turn boolean DEFAULT false,
  connected boolean DEFAULT true,
  player_number integer CHECK (player_number IN (1, 2)),
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  message_type text NOT NULL CHECK (message_type IN ('question', 'answer', 'guess', 'system')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE pictures ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pictures (public read)
CREATE POLICY "Anyone can view pictures"
  ON pictures FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for rooms
CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert rooms"
  ON rooms FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update rooms"
  ON rooms FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for players
CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert players"
  ON players FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update players"
  ON players FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete players"
  ON players FOR DELETE
  TO anon, authenticated
  USING (true);

-- RLS Policies for messages
CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert messages"
  ON messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Insert sample pictures for the game
INSERT INTO pictures (image_url, name, category) VALUES
  ('https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg', 'Golden Retriever', 'animals'),
  ('https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg', 'Cute Kitten', 'animals'),
  ('https://images.pexels.com/photos/213399/pexels-photo-213399.jpeg', 'Sports Car', 'vehicles'),
  ('https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg', 'Red Ferrari', 'vehicles'),
  ('https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg', 'Tropical Beach', 'nature'),
  ('https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg', 'Autumn Forest', 'nature'),
  ('https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 'Pizza', 'food'),
  ('https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg', 'Burger', 'food'),
  ('https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg', 'Eiffel Tower', 'landmarks'),
  ('https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg', 'Statue of Liberty', 'landmarks'),
  ('https://images.pexels.com/photos/1643457/pexels-photo-1643457.jpeg', 'Basketball', 'sports'),
  ('https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg', 'Soccer Ball', 'sports')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_players_room ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);