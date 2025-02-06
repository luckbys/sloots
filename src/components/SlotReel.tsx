import { FC } from 'react';
import SlotSymbol from './SlotSymbol';

interface SlotReelProps {
  symbols: string[];
  isSpinning: boolean;
  currentSymbol: string;
}

const SlotReel: FC<SlotReelProps> = ({ symbols, isSpinning, currentSymbol }) => {
  return (
    <div className="reel w-36 h-36 mx-2 rounded-lg flex items-center justify-center relative bg-black/80 border-4">
      <div className="absolute inset-0 bg-black/40 pointer-events-none rounded-lg" />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-purple-500/10 rounded-lg" />
      <div className={`transition-all duration-300 ${isSpinning ? 'blur-md' : ''}`}>
        <SlotSymbol symbol={currentSymbol} isSpinning={isSpinning} />
      </div>
    </div>
  );
};

export default SlotReel;