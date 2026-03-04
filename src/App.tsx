import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { WaitingRoom } from './components/WaitingRoom';
import { GameScreen } from './components/GameScreen';
import { supabase } from './lib/supabase';
import { Room, Player } from './types/game';

type GamePhase = 'home' | 'waiting' | 'playing';

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('home');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!roomCode) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const subscribeToRoom = async () => {
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode)
        .maybeSingle();

      if (!room) return;

      setRoomId(room.id);

      const { data: initialPlayers } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.id);

      if (initialPlayers) {
        setPlayers(initialPlayers);
      }

      if (room.status === 'playing') {
        setGamePhase('playing');
      }

      channel = supabase
        .channel(`room:${room.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` },
          (payload) => {
            const updatedRoom = payload.new as Room;
            if (updatedRoom.status === 'playing') {
              setGamePhase('playing');
            } else if (updatedRoom.status === 'waiting') {
              setGamePhase('waiting');
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${room.id}` },
          async () => {
            const { data: updatedPlayers } = await supabase
              .from('players')
              .select('*')
              .eq('room_id', room.id);

            if (updatedPlayers) {
              setPlayers(updatedPlayers);
            }
          }
        )
        .subscribe();
    };

    subscribeToRoom();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [roomCode]);

  const handleJoinGame = (code: string, id: string, name: string) => {
    setRoomCode(code);
    setPlayerId(id);
    setPlayerName(name);
    setGamePhase('waiting');
  };

  const handleLeaveGame = async () => {
    if (playerId) {
      await supabase.from('players').delete().eq('id', playerId);
    }

    setGamePhase('home');
    setRoomCode(null);
    setRoomId(null);
    setPlayerId(null);
    setPlayerName(null);
    setPlayers([]);
  };

  const handleGameStart = () => {
    setGamePhase('playing');
  };

  if (gamePhase === 'home') {
    return <Home onJoinGame={handleJoinGame} />;
  }

  if (gamePhase === 'waiting' && roomCode && roomId) {
    return (
      <WaitingRoom
        roomCode={roomCode}
        roomId={roomId}
        players={players}
        onGameStart={handleGameStart}
      />
    );
  }

  if (gamePhase === 'playing' && roomCode && playerId && playerName) {
    return (
      <GameScreen
        roomCode={roomCode}
        playerId={playerId}
        playerName={playerName}
        onLeave={handleLeaveGame}
      />
    );
  }

  return null;
}

export default App;
