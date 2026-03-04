import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Message, Player } from '../types/game';

interface ChatPanelProps {
  messages: Message[];
  players: Player[];
  currentPlayerId: string;
  isMyTurn: boolean;
  onSendQuestion: (question: string) => void;
  onAnswerQuestion: (answer: string) => void;
}

export const ChatPanel = ({
  messages,
  players,
  currentPlayerId,
  isMyTurn,
  onSendQuestion,
  onAnswerQuestion,
}: ChatPanelProps) => {
  const [questionInput, setQuestionInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const lastMessage = messages[messages.length - 1];
  const needsAnswer =
    lastMessage &&
    lastMessage.message_type === 'question' &&
    lastMessage.player_id !== currentPlayerId &&
    !isMyTurn;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendQuestion = () => {
    if (!questionInput.trim()) return;
    onSendQuestion(questionInput.trim());
    setQuestionInput('');
  };

  const handleAnswer = (answer: string) => {
    onAnswerQuestion(answer);
  };

  const getPlayerName = (playerId: string | null) => {
    if (!playerId) return 'System';
    const player = players.find((p) => p.id === playerId);
    return player ? player.player_name : 'Unknown';
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Chat</h2>
        <p className="text-blue-100 text-sm">Ask yes/no questions</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => {
          const isCurrentPlayer = message.player_id === currentPlayerId;
          const isSystem = message.message_type === 'system';

          if (isSystem) {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-full max-w-md text-center">
                  {message.content}
                </div>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentPlayer ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs ${isCurrentPlayer ? 'text-right' : 'text-left'}`}>
                <p className="text-xs text-gray-500 mb-1">{getPlayerName(message.player_id)}</p>
                <div
                  className={`inline-block px-4 py-2 rounded-2xl ${
                    message.message_type === 'question'
                      ? isCurrentPlayer
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                      : message.message_type === 'answer'
                      ? isCurrentPlayer
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-900'
                      : 'bg-red-100 text-red-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {needsAnswer && (
        <div className="border-t border-gray-200 p-4 bg-yellow-50">
          <p className="text-sm font-medium text-gray-900 mb-3">Answer the question:</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleAnswer('Yes')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswer('No')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              No
            </button>
          </div>
        </div>
      )}

      {!needsAnswer && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
              placeholder={
                isMyTurn ? 'Ask a yes/no question...' : "Wait for opponent's answer..."
              }
              disabled={!isMyTurn}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendQuestion}
              disabled={!isMyTurn || !questionInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
