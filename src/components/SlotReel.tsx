import { FC, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/animations.css';

interface SlotReelProps {
  symbols: readonly string[];
  isSpinning: boolean;
  currentSymbols: string[];
  delay?: number;
}

const SlotReel: FC<SlotReelProps> = ({ symbols, isSpinning, currentSymbols, delay = 0 }) => {
  const [spinning, setSpinning] = useState(false);
  const [displayedSymbols, setDisplayedSymbols] = useState<string[]>(() => 
    currentSymbols || Array.from({ length: 3 }, () => symbols[0])
  );
  const [spinSpeed, setSpinSpeed] = useState(50);
  const [spinDirection, setSpinDirection] = useState<'up' | 'down'>('up');

  const generateRandomSymbols = useCallback(() => {
    return Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
  }, [symbols]);

  // Efeito para controlar a animação de giro
  useEffect(() => {
    let spinInterval: NodeJS.Timeout;
    let startDelay: NodeJS.Timeout;
    let speedInterval: NodeJS.Timeout;

    const startSpinning = () => {
      setSpinning(true);
      setSpinSpeed(50); // Velocidade inicial mais rápida

      let spinCount = 0;
      const maxSpins = 20; // Número máximo de giros completos

      spinInterval = setInterval(() => {
        setDisplayedSymbols(prev => {
          spinCount++;
          
          // Desacelera gradualmente após atingir o número máximo de giros
          if (spinCount > maxSpins) {
            const newSpeed = spinSpeed + 10;
            setSpinSpeed(newSpeed);
            
            if (newSpeed > 200) {
              stopSpinning();
              return currentSymbols;
            }
          }
          
          return generateRandomSymbols();
        });

        // Alterna a direção do giro para criar efeito de rolagem
        setSpinDirection(prev => prev === 'up' ? 'down' : 'up');
      }, spinSpeed);
    };

    const stopSpinning = () => {
      clearInterval(spinInterval);
      clearInterval(speedInterval);
      
      // Efeito de parada suave
      const finalizeStop = async () => {
        // Simula alguns giros finais mais lentos
        for (let i = 0; i < 3; i++) {
          await new Promise(resolve => setTimeout(resolve, 100 + i * 100));
          setDisplayedSymbols(generateRandomSymbols());
        }
        
        // Define os símbolos finais com um pequeno atraso
        setTimeout(() => {
          setDisplayedSymbols(currentSymbols);
          setSpinning(false);
        }, 200);
      };
      
      finalizeStop();
    };

    if (isSpinning && !spinning) {
      startDelay = setTimeout(startSpinning, delay);
    } else if (!isSpinning && spinning) {
      stopSpinning();
    }

    return () => {
      clearTimeout(startDelay);
      clearInterval(spinInterval);
      clearInterval(speedInterval);
    };
  }, [isSpinning, spinning, symbols, delay, currentSymbols, spinSpeed, generateRandomSymbols]);

  return (
    <div className="relative w-24 h-72 bg-gradient-to-b from-black/60 via-black/40 to-black/60 rounded-lg overflow-hidden">
      {/* Moldura metálica */}
      <div className="absolute inset-0 border-4 border-gradient-metal rounded-lg"></div>
      
      {/* Efeito de vidro */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5"></div>
      
      {/* Linhas de divisão */}
      <div className="absolute inset-x-0 top-1/3 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
      <div className="absolute inset-x-0 top-2/3 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
      
      {/* Linha de vitória central */}
      <div className="absolute inset-x-0 top-1/2 h-24 -translate-y-1/2">
        <div className="h-full bg-yellow-500/10 border-y border-yellow-500/20 backdrop-blur-sm"></div>
        {/* Brilhos laterais */}
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-yellow-500/40 to-transparent"></div>
        <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-yellow-500/40 to-transparent"></div>
      </div>
      
      {/* Container dos símbolos com perspectiva */}
      <div className="absolute inset-0 flex flex-col items-center justify-center perspective">
        <div className={`relative w-full h-full flex flex-col items-center justify-center ${
          spinning ? 'animate-slot-spin' : ''
        }`}>
          {displayedSymbols.map((symbol, index) => (
            <motion.div
              key={`${index}-${symbol}-${spinning}`}
              initial={{ 
                y: spinning ? (spinDirection === 'up' ? 100 : -100) : 0,
                opacity: spinning ? 0 : 1,
                scale: spinning ? 0.8 : 1,
                rotateX: spinning ? (spinDirection === 'up' ? 45 : -45) : 0
              }}
              animate={{ 
                y: 0,
                opacity: 1,
                scale: 1,
                rotateX: 0
              }}
              exit={{ 
                y: spinning ? (spinDirection === 'up' ? -100 : 100) : 0,
                opacity: 0,
                scale: 0.8,
                rotateX: spinning ? (spinDirection === 'up' ? -45 : 45) : 0
              }}
              transition={{ 
                type: "spring",
                stiffness: spinning ? 100 : 200,
                damping: spinning ? 10 : 20,
                mass: 1,
                duration: spinning ? 0.2 : 0.3
              }}
              className={`
                absolute w-24 h-24 flex items-center justify-center
                ${spinning ? 'animate-slot-blur' : 'animate-bounce-soft'}
                ${index === 1 
                  ? 'text-6xl z-10 symbol-glow' 
                  : 'text-4xl opacity-50 blur-[0.3px]'}
                transform-gpu transition-all duration-200
              `}
              style={{
                top: `${index * 33.33}%`,
                textShadow: index === 1 
                  ? '0 0 10px rgba(234,179,8,0.5), 0 0 20px rgba(234,179,8,0.3)' 
                  : 'none',
                transform: `translateZ(${index === 1 ? '20px' : '0px'})`
              }}
            >
              {symbol}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reflexo de luz */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 pointer-events-none"></div>
      
      {/* Brilho nas bordas durante o spin */}
      {spinning && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 border-2 border-yellow-500/50 rounded-lg"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-t from-yellow-500/0 via-yellow-500/10 to-yellow-500/0"
          />
        </>
      )}
    </div>
  );
};

export default SlotReel;