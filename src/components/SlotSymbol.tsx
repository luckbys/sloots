import { FC } from 'react';

interface SlotSymbolProps {
  symbol: string;
  isSpinning: boolean;
}

const SlotSymbol: FC<SlotSymbolProps> = ({ symbol, isSpinning }) => {
  return (
    <div 
      className={`flex items-center justify-center h-full text-5xl font-bold
        ${isSpinning ? 'animate-spin-slot' : 'animate-none'}
        ${!isSpinning && 'transition-all duration-300 hover:scale-110 hover:rotate-6'}`}
    >
      {symbol}
    </div>
  );
};

export default SlotSymbol;