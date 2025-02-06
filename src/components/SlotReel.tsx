import { FC, useEffect, useState } from 'react';
import SlotSymbol from './SlotSymbol';
import '../styles/animations.css';

interface SlotReelProps {
  symbols: string[];
  isSpinning: boolean;
  currentSymbol: string;
  delay?: number;
}

const SlotReel: FC<SlotReelProps> = ({ symbols, isSpinning, currentSymbol, delay = 0 }) => {
  const [spinningSymbols, setSpinningSymbols] = useState<string[]>([]);
  
  useEffect(() => {
    if (isSpinning) {
      const interval = setInterval(() => {
        setSpinningSymbols(prev => {
          const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
          return [...prev.slice(1), randomSymbol];
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isSpinning, symbols]);

  return (
    <div className="reel w-36 h-36 rounded-lg relative bg-black/90 border-4 border-yellow-500/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.6)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-yellow-500/5 rounded-lg" />
      <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 rounded-lg" />
      
      <div 
        className="relative z-10 w-full h-full flex items-center justify-center"
        style={{ 
          transition: 'transform 0.5s ease-out',
          transitionDelay: `${delay}ms`,
          transform: isSpinning ? 'translateY(-100%)' : 'translateY(0)'
        }}
      >
        {isSpinning ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {spinningSymbols.map((symbol, index) => (
              <div 
                key={index}
                className="text-5xl mb-2 slot-spinning"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {symbol}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-6xl transform hover:scale-110 transition-transform duration-300">
            <SlotSymbol symbol={currentSymbol} isSpinning={false} />
          </div>
        )}
      </div>

      {/* Efeito de brilho nas bordas */}
      <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] rounded-lg pointer-events-none" />
      
      {/* Reflexo */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default SlotReel;