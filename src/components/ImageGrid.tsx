import { useState } from 'react';
import { Picture } from '../types/game';
import { Check } from 'lucide-react';

interface ImageGridProps {
  pictures: Picture[];
  onGuess: (pictureId: string) => void;
  disabled: boolean;
}

export const ImageGrid = ({ pictures, onGuess, disabled }: ImageGridProps) => {
  const [selectedPicture, setSelectedPicture] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSelectPicture = (pictureId: string) => {
    setSelectedPicture(pictureId);
    setShowConfirm(true);
  };

  const handleConfirmGuess = () => {
    if (selectedPicture) {
      onGuess(selectedPicture);
      setSelectedPicture(null);
      setShowConfirm(false);
    }
  };

  const handleCancelGuess = () => {
    setSelectedPicture(null);
    setShowConfirm(false);
  };

  const selectedPictureData = pictures.find((p) => p.id === selectedPicture);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Available Pictures</h3>
        <span className="text-sm text-gray-500">{pictures.length} pictures</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {pictures.map((picture) => (
          <button
            key={picture.id}
            onClick={() => handleSelectPicture(picture.id)}
            disabled={disabled}
            className={`relative group overflow-hidden rounded-lg border-2 transition-all ${
              selectedPicture === picture.id
                ? 'border-blue-600 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
          >
            <div className="aspect-square">
              <img
                src={picture.image_url}
                alt={picture.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white text-xs font-medium text-center">{picture.name}</p>
              </div>
            </div>
            {selectedPicture === picture.id && (
              <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {showConfirm && selectedPictureData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Confirm Your Guess</h3>
            <div className="space-y-3">
              <p className="text-gray-600">
                Are you sure you want to guess this picture?
              </p>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                <img
                  src={selectedPictureData.image_url}
                  alt={selectedPictureData.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <p className="font-semibold text-gray-900">{selectedPictureData.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{selectedPictureData.category}</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> If you guess incorrectly, you'll lose your turn!
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelGuess}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmGuess}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                Confirm Guess
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
