import { useState } from 'react';
import { Gamepad2, Users } from 'lucide-react';
import { supabase, generateRoomCode } from '../lib/supabase';

interface HomeProps {
  onJoinGame: (roomCode: string, playerId: string, playerName: string) => void;
}

export const Home = ({ onJoinGame }: HomeProps) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createRoom = async () => {
    if (!supabase) {
      setError('Supabase is not configured');
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newRoomCode = generateRoomCode();

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({ room_code: newRoomCode, status: 'waiting' })
        .select()
        .single();

      if (roomError) throw roomError;

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          player_name: playerName.trim(),
          player_number: 1,
          is_turn: true,
          connected: true,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      onJoinGame(newRoomCode, player.id, playerName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!supabase) {
      setError('Supabase is not configured');
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .maybeSingle();

      if (roomError) throw roomError;
      if (!room) {
        setError('Room not found');
        return;
      }

      const { data: existingPlayers, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.id);

      if (playersError) throw playersError;

      if (existingPlayers.length >= 2) {
        setError('Room is full');
        return;
      }

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          player_name: playerName.trim(),
          player_number: 2,
          is_turn: false,
          connected: true,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      onJoinGame(roomCode.toUpperCase(), player.id, playerName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-2xl">
              <Gamepad2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Guess the Picture</h1>
          <p className="text-gray-600 max-w-sm mx-auto">
            A 2-player game where you ask yes/no questions to guess your opponent's secret picture
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={createRoom}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Users className="w-5 h-5" />
              Create New Room
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-lg font-mono tracking-wider"
              disabled={loading}
              maxLength={6}
            />

            <button
              onClick={joinRoom}
              disabled={loading}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Gamepad2 className="w-5 h-5" />
              Join Room
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Share the room code with your friend to play together!</p>
        </div>
      </div>
    </div>
  );
};
