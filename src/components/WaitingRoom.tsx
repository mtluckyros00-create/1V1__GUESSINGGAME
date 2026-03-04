import { useEffect, useState } from 'react';
import { Copy, Check, Users, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Player, Picture } from '../types/game';

interface WaitingRoomProps {
  roomCode: string;
  roomId: string;
  players: Player[];
  onGameStart: () => void;
}

export const WaitingRoom = ({ roomCode, roomId, players, onGameStart }: WaitingRoomProps) => {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (players.length === 2) {
      startGame();
    }
  }, [players]);

  const startGame = async () => {
    const { data: pictures } = await supabase.from('pictures').select('*');

    if (!pictures || pictures.length < 2) return;

    const shuffled = [...pictures].sort(() => Math.random() - 0.5);
    const picture1 = shuffled[0];
    const picture2 = shuffled[1];

    await supabase.from('players').update({ picture_id: picture1.id }).eq('id', players[0].id);

    await supabase.from('players').update({ picture_id: picture2.id }).eq('id', players[1].id);

    await supabase.from('rooms').update({ status: 'playing' }).eq('id', roomId);

    await supabase.from('messages').insert({
      room_id: roomId,
      player_id: null,
      message_type: 'system',
      content: 'Game started! Players have been assigned their secret pictures.',
    });

    onGameStart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-2xl">
              <Users className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Waiting Room</h1>
          <p className="text-gray-600">Share this code with your friend to start playing</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Room Code</p>
            <div className="flex items-center justify-center gap-2">
              <div className="text-4xl font-bold font-mono tracking-wider text-blue-600 bg-blue-50 px-6 py-3 rounded-lg">
                {roomCode}
              </div>
              <button
                onClick={copyRoomCode}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                title="Copy room code"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Players ({players.length}/2)</p>
            <div className="space-y-2">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{player.player_name}</span>
                  <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              ))}
              {players.length < 2 && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border-2 border-dashed border-gray-300">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                  </div>
                  <span className="text-gray-500">Waiting for player...</span>
                </div>
              )}
            </div>
          </div>

          {players.length < 2 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-800">
                Waiting for another player to join...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
