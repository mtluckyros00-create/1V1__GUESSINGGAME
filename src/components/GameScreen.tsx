import { useState, useEffect } from 'react';
import { Trophy, RotateCcw, LogOut, User } from 'lucide-react';
import { ChatPanel } from './ChatPanel';
import { ImageGrid } from './ImageGrid';
import { useGameState } from '../hooks/useGameState';
import { supabase } from '../lib/supabase';

interface GameScreenProps {
  roomCode: string;
  playerId: string;
  playerName: string;
  onLeave: () => void;
}

export const GameScreen = ({ roomCode, playerId, playerName, onLeave }: GameScreenProps) => {
  const { gameState, loading, sendMessage, updatePlayerTurn, makeGuess } = useGameState(
    roomCode,
    playerId
  );

  const currentPlayer = gameState.players.find((p) => p.id === playerId);
  const opponentPlayer = gameState.players.find((p) => p.id !== playerId);
  const isMyTurn = currentPlayer?.is_turn || false;
  const isGameOver = gameState.room?.status === 'finished';
  const winner = gameState.players.find((p) => p.id === gameState.room?.winner_id);

  const handleSendQuestion = async (question: string) => {
    await sendMessage('question', question);
  };

  const handleAnswerQuestion = async (answer: string) => {
    await sendMessage('answer', answer);
    if (currentPlayer) {
      await updatePlayerTurn(opponentPlayer!);
    }
  };

  const handleGuess = async (pictureId: string) => {
    await makeGuess(pictureId);
  };

  const handlePlayAgain = async () => {
    if (!gameState.room) return;

    await supabase.from('messages').delete().eq('room_id', gameState.room.id);

    await supabase.from('players').update({
      picture_id: null,
      is_turn: false,
      connected: true,
    }).eq('room_id', gameState.room.id);

    await supabase.from('players').update({ is_turn: true }).eq('id', gameState.players[0].id);

    await supabase.from('rooms').update({
      status: 'waiting',
      winner_id: null,
    }).eq('id', gameState.room.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (isGameOver && winner) {
    const isWinner = winner.id === playerId;
    const winnerPicture = gameState.pictures.find((p) => p.id === opponentPlayer?.picture_id);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <div
              className={`p-6 rounded-full ${
                isWinner ? 'bg-yellow-100' : 'bg-gray-100'
              }`}
            >
              <Trophy
                className={`w-16 h-16 ${
                  isWinner ? 'text-yellow-600' : 'text-gray-400'
                }`}
              />
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isWinner ? 'You Win!' : 'You Lose'}
            </h2>
            <p className="text-lg text-gray-600">
              {isWinner
                ? 'Congratulations! You guessed correctly!'
                : `${winner.player_name} guessed correctly!`}
            </p>
          </div>

          {winnerPicture && (
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-3">
                {isWinner ? "Your opponent's picture was:" : 'The correct picture was:'}
              </p>
              <img
                src={winnerPicture.image_url}
                alt={winnerPicture.name}
                className="w-48 h-48 object-cover rounded-lg mx-auto mb-3"
              />
              <p className="font-semibold text-gray-900 text-lg">{winnerPicture.name}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handlePlayAgain}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
            <button
              onClick={onLeave}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Leave
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 px-4 py-2 rounded-lg">
                <p className="text-white font-mono font-bold text-lg">{roomCode}</p>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">{playerName}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`px-4 py-2 rounded-lg font-semibold ${
                  isMyTurn
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
              </div>

              <button
                onClick={onLeave}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Leave
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="h-[calc(100vh-180px)]">
            <ChatPanel
              messages={gameState.messages}
              players={gameState.players}
              currentPlayerId={playerId}
              isMyTurn={isMyTurn}
              onSendQuestion={handleSendQuestion}
              onAnswerQuestion={handleAnswerQuestion}
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 overflow-y-auto h-[calc(100vh-180px)]">
            <ImageGrid
              pictures={gameState.pictures}
              onGuess={handleGuess}
              disabled={!isMyTurn}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
