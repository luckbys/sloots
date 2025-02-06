import { FC } from 'react';
import SlotSymbol from './SlotSymbol';

interface SlotReelProps {
  symbols: string[];
  isSpinning: boolean;
  currentSymbol: string;
}

const SlotReel: FC<SlotReelProps> = ({ symbols, isSpinning, currentSymbol }) => {
  return (
    <div className="reel w-36 h-36 rounded-lg flex items-center justify-center relative bg-black/90 border-4 border-yellow-500/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-yellow-500/5 rounded-lg" />
      <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 rounded-lg" />
      <div 
        className={`
          transition-all duration-300 text-5xl
          ${isSpinning ? 'animate-spin blur-md' : 'hover:scale-110 transition-transform'}
          relative z-10
        `}
      >
        <SlotSymbol symbol={currentSymbol} isSpinning={isSpinning} />
      </div>
      <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] rounded-lg pointer-events-none" />
    </div>
  );
};

export default SlotReel;