import { FC } from 'react';
import { Play, Pause, Settings } from 'lucide-react';

interface AutoplayControlsProps {
  isActive: boolean;
  remainingSpins: number;
  totalSpins: number;
  onStart: (spins: number) => void;
  onStop: () => void;
  disabled?: boolean;
}

const SPIN_OPTIONS = [10, 25, 50, 100];

const AutoplayControls: FC<AutoplayControlsProps> = ({
  isActive,
  remainingSpins,
  totalSpins,
  onStart,
  onStop,
  disabled
}) => {
  return (
    <div className="flex flex-col gap-2">
      {/* Botão principal */}
      {isActive ? (
        <button
          onClick={onStop}
          className="flex items-center justify-center gap-2 px-4 py-2 
            bg-gradient-to-r from-red-600 to-red-500 rounded-lg text-white 
            font-bold shadow-lg hover:shadow-xl transition-all transform 
            hover:scale-105 border-2 border-red-400"
        >
          <Pause className="w-4 h-4" />
          <span>Parar ({remainingSpins}/{totalSpins})</span>
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          {SPIN_OPTIONS.map(spins => (
            <button
              key={spins}
              onClick={() => onStart(spins)}
              disabled={disabled}
              className="flex items-center gap-2 px-3 py-2 
                bg-gradient-to-r from-green-600 to-green-500 rounded-lg 
                text-white font-bold shadow-lg hover:shadow-xl transition-all 
                transform hover:scale-105 border-2 border-green-400
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              <span>{spins}x</span>
            </button>
          ))}
        </div>
      )}

      {/* Configurações de Autoplay */}
      <div className="bg-black/30 p-3 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
          <Settings className="w-4 h-4" />
          <span>Parar Autoplay se:</span>
        </div>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" defaultChecked />
            <span>Ganhar um Jackpot</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" defaultChecked />
            <span>Saldo abaixo da aposta</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" defaultChecked />
            <span>Ganho maior que R$100</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AutoplayControls; 