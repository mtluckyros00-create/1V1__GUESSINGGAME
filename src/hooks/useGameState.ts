import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { GameState, Player, Message, Room, Picture } from '../types/game';

export const useGameState = (roomCode: string | null, playerId: string | null) => {
  const [gameState, setGameState] = useState<GameState>({
    room: null,
    players: [],
    messages: [],
    pictures: [],
    currentPlayerId: playerId,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGameData = useCallback(async () => {
    if (!roomCode) return;

    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode)
        .maybeSingle();

      if (roomError) throw roomError;
      if (!room) {
        setError('Room not found');
        return;
      }

      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.id)
        .order('player_number');

      if (playersError) throw playersError;

      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', room.id)
        .order('created_at');

      if (messagesError) throw messagesError;

      const { data: pictures, error: picturesError } = await supabase
        .from('pictures')
        .select('*');

      if (picturesError) throw picturesError;

      setGameState({
        room,
        players: players || [],
        messages: messages || [],
        pictures: pictures || [],
        currentPlayerId: playerId,
      });
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  }, [roomCode, playerId]);

  useEffect(() => {
    loadGameData();
  }, [loadGameData]);

  useEffect(() => {
    if (!gameState.room) return;

    const roomChannel = supabase
      .channel(`room:${gameState.room.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${gameState.room.id}` },
        (payload) => {
          setGameState((prev) => ({ ...prev, room: payload.new as Room }));
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${gameState.room.id}` },
        () => {
          loadGameData();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${gameState.room.id}` },
        (payload) => {
          setGameState((prev) => ({
            ...prev,
            messages: [...prev.messages, payload.new as Message],
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [gameState.room, loadGameData]);

  const sendMessage = async (type: Message['message_type'], content: string) => {
    if (!gameState.room || !playerId) return;

    const { error } = await supabase.from('messages').insert({
      room_id: gameState.room.id,
      player_id: playerId,
      message_type: type,
      content,
    });

    if (error) console.error('Error sending message:', error);
  };

  const updatePlayerTurn = async (currentPlayer: Player) => {
    if (!gameState.room) return;

    const otherPlayer = gameState.players.find((p) => p.id !== currentPlayer.id);
    if (!otherPlayer) return;

    await supabase.from('players').update({ is_turn: false }).eq('id', currentPlayer.id);
    await supabase.from('players').update({ is_turn: true }).eq('id', otherPlayer.id);
  };

  const makeGuess = async (pictureId: string) => {
    if (!gameState.room || !playerId) return;

    const currentPlayer = gameState.players.find((p) => p.id === playerId);
    const otherPlayer = gameState.players.find((p) => p.id !== playerId);

    if (!currentPlayer || !otherPlayer) return;

    const isCorrect = otherPlayer.picture_id === pictureId;

    if (isCorrect) {
      await supabase.from('rooms').update({
        status: 'finished',
        winner_id: playerId,
      }).eq('id', gameState.room.id);

      await sendMessage('system', `${currentPlayer.player_name} guessed correctly and wins!`);
    } else {
      await sendMessage('system', `${currentPlayer.player_name} guessed incorrectly. Turn lost!`);
      await updatePlayerTurn(currentPlayer);
    }
  };

  return {
    gameState,
    loading,
    error,
    sendMessage,
    updatePlayerTurn,
    makeGuess,
    reload: loadGameData,
  };
};
