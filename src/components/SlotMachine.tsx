import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import SlotReel from './SlotReel';
import { Coins, ChevronUp, ChevronDown, Crown, Diamond, Star, Gift, Zap, TrendingUp } from 'lucide-react';
import WinHistory, { WinRecord } from './WinHistory';


const SYMBOLS = ['🍒', '7️⃣', '🎰', '💎', '🌟', '🍋', '��', '🃏'] as const;
const INITIAL_BALANCE = 1000;
const SPIN_DURATION = 2000;

const PRIZES = {
  '7️⃣': 20,    // Jackpot
  '💎': 15,    // Premium
  '👑': 12,    // Alto
  '🌟': 10,    // Médio-alto
  '🎰': 8,     // Médio
  '🍒': 6,     // Médio-baixo
  '🍋': 4,     // Baixo
  '🃏': 2,     // Curinga - pode substituir qualquer símbolo
} as const;

const AUDIO = {
  spin: new Audio('/sounds/spin.mp3'),
  win: new Audio('/sounds/win.mp3'),
  jackpot: new Audio('/sounds/jackpot.mp3'),
  click: new Audio('/sounds/click.mp3'),
};

Object.values(AUDIO).forEach(audio => {
  audio.load();
});

// Constantes para o sistema de níveis
const LEVEL_XP_BASE = 1000; // XP base para subir de nível
const LEVEL_MULTIPLIER = 1.5; // Multiplicador de XP por nível

// Bônus diários
const DAILY_BONUS = {
  1: 100,    // Dia 1: 100 moedas
  2: 200,    // Dia 2: 200 moedas
  3: 300,    // Dia 3: 300 moedas
  4: 400,    // Dia 4: 400 moedas
  5: 500,    // Dia 5: 500 moedas
  6: 750,    // Dia 6: 750 moedas
  7: 1000,   // Dia 7: 1000 moedas
} as const;

const SlotMachine = () => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [bet, setBet] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(['7️⃣', '7️⃣', '7️⃣']);
  const [lastWin, setLastWin] = useState(0);
  const [jackpotAmount, setJackpotAmount] = useState(5000);
  const [streak, setStreak] = useState(0);
  const [maxWin, setMaxWin] = useState(0);
  const [winHistory, setWinHistory] = useState<WinRecord[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [lastLoginDate, setLastLoginDate] = useState<string | null>(null);
  const [loginStreak, setLoginStreak] = useState(0);
  const [nextBonusTime, setNextBonusTime] = useState<Date | null>(null);

  const isWildcard = useCallback((symbol: string) => symbol === '🃏', []);

  const generateNewReels = useCallback(() => {
    return Array.from({ length: 3 }, () => 
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    );
  }, []);

  const playSound = useCallback((type: keyof typeof AUDIO) => {
    AUDIO[type].currentTime = 0;
    AUDIO[type].play().catch(() => {});
  }, []);

  const maxBet = useMemo(() => Math.min(100, balance), [balance]);

  // Calcular XP necessário para o próximo nível
  const nextLevelXp = useMemo(() => {
    return Math.floor(LEVEL_XP_BASE * Math.pow(LEVEL_MULTIPLIER, level - 1));
  }, [level]);

  const spin = useCallback(() => {
    if (balance < bet) {
      toast.error("Saldo insuficiente!");
      return;
    }
    if (isSpinning) return;

    playSound('spin');
    setIsSpinning(true);
    setBalance(prev => prev - bet);
    setLastWin(0);

    requestAnimationFrame(() => {
      setTimeout(() => {
        const newReels = generateNewReels();
        setReels(newReels);
        setIsSpinning(false);
        checkWin(newReels);
      }, SPIN_DURATION);
    });
  }, [balance, bet, isSpinning, generateNewReels, playSound]);

  // Verificar bônus diário
  useEffect(() => {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('lastLoginDate');
    const streak = Number(localStorage.getItem('loginStreak')) || 0;

    if (lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastLogin === yesterday.toDateString()) {
        // Usuário logou em dias consecutivos
        const newStreak = (streak % 7) + 1;
        setLoginStreak(newStreak);
        localStorage.setItem('loginStreak', String(newStreak));
        
        const bonus = DAILY_BONUS[newStreak as keyof typeof DAILY_BONUS];
        setBalance(prev => prev + bonus);
        toast.success(`🎁 Bônus diário: +${bonus} moedas! (Dia ${newStreak})`);
      } else {
        // Quebrou a sequência
        setLoginStreak(1);
        localStorage.setItem('loginStreak', '1');
        setBalance(prev => prev + DAILY_BONUS[1]);
        toast.success(`🎁 Bônus diário: +${DAILY_BONUS[1]} moedas!`);
      }

      localStorage.setItem('lastLoginDate', today);
      setLastLoginDate(today);
    }
  }, []);

  // Sistema de multiplicador temporário
  const activateMultiplier = useCallback(() => {
    if (balance >= 500) {
      setBalance(prev => prev - 500);
      setMultiplier(2);
      toast.success('🔥 Multiplicador 2x ativado por 5 jogadas!');
    } else {
      toast.error('Saldo insuficiente para ativar o multiplicador!');
    }
  }, [balance]);

  const checkWin = useCallback((newReels: string[]) => {
    let winAmount = 0;
    let xpGained = 0;
    let message = '';
    let isJackpot = false;

    const symbolsEqual = newReels.every((symbol, _, arr) => 
      symbol === arr[0] || isWildcard(symbol) || isWildcard(arr[0])
    );

    if (symbolsEqual) {
      const baseSymbol = newReels.find(s => !isWildcard(s)) || newReels[0];
      const multiplier = PRIZES[baseSymbol as keyof typeof PRIZES];
      
      const wildcardCount = newReels.filter(isWildcard).length;
      const wildcardBonus = wildcardCount * 0.5;
      
      winAmount = bet * multiplier * (1 + wildcardBonus);

      if (newReels.every(s => s === '7️⃣')) {
        winAmount += jackpotAmount;
        isJackpot = true;
        message = `🎉 MEGA JACKPOT! Você ganhou ${winAmount} moedas! 🎉`;
        setJackpotAmount(5000);
      } else {
        message = `🎉 Você ganhou ${winAmount} moedas! 🎉`;
      }
    } 
    else if (
      newReels[0] === newReels[1] || 
      newReels[1] === newReels[2] || 
      newReels[0] === newReels[2] ||
      newReels.filter(isWildcard).length >= 1
    ) {
      winAmount = Math.floor(bet * 1.5);
      message = `Você ganhou ${winAmount} moedas!`;
    }

    if (winAmount > 0) {
      // Aplicar multiplicador ao prêmio
      const finalWinAmount = Math.floor(winAmount * multiplier);
      
      // Calcular XP ganho
      xpGained = Math.floor(finalWinAmount * 0.1); // 10% do prêmio em XP
      
      requestAnimationFrame(() => {
        setBalance(prev => prev + finalWinAmount);
        setLastWin(finalWinAmount);
        setMaxWin(prev => Math.max(prev, finalWinAmount));
        setStreak(prev => prev + 1);
        
        // Atualizar XP e verificar level up
        const newXp = xp + xpGained;
        if (newXp >= nextLevelXp) {
          const bonusCoins = level * 100;
          setLevel(prev => prev + 1);
          setXp(newXp - nextLevelXp);
          setBalance(prev => prev + bonusCoins);
          toast.success(`🌟 Level Up! Nível ${level + 1}! Bônus: +${bonusCoins} moedas!`);
        } else {
          setXp(newXp);
        }

        const newRecord: WinRecord = {
          id: nanoid(),
          amount: finalWinAmount,
          symbols: newReels,
          timestamp: new Date(),
          isJackpot
        };
        
        setWinHistory(prev => [newRecord, ...prev].slice(0, 10));
        
        playSound(isJackpot ? 'jackpot' : 'win');

        toast.success(message, {
          duration: isJackpot ? 5000 : 2000,
        });

        // Reduzir contador do multiplicador
        if (multiplier > 1) {
          setMultiplier(prev => {
            if (prev === 2) {
              toast.info('Multiplicador 2x terminou!');
              return 1;
            }
            return prev;
          });
        }
      });
    } else {
      setStreak(0);
    }
  }, [multiplier, xp, level, nextLevelXp]);

  useEffect(() => {
    let rafId: number;
    let lastUpdate = Date.now();

    const updateJackpot = () => {
      const now = Date.now();
      const delta = now - lastUpdate;
      
      if (delta >= 1000) {
        setJackpotAmount(prev => prev + 1);
        lastUpdate = now;
      }
      
      rafId = requestAnimationFrame(updateJackpot);
    };

    rafId = requestAnimationFrame(updateJackpot);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleBetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBet = parseInt(event.target.value);
    if (newBet <= balance) {
      setBet(newBet);
    }
  };

  const prizeTable = useMemo(() => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="text-yellow-400 mb-2">Três Iguais:</h4>
        {Object.entries(PRIZES).map(([symbol, multiplier]) => (
          <div key={symbol} className="flex items-center gap-2 text-sm">
            <span>{symbol} x3 = {multiplier}x aposta</span>
            {symbol === '7️⃣' && <span className="text-xs">(+ Jackpot!)</span>}
          </div>
        ))}
      </div>
      <div>
        <h4 className="text-yellow-400 mb-2">Especiais:</h4>
        <div className="text-sm space-y-2">
          <div>Dois Iguais = 1.5x aposta</div>
          <div>🃏 Curinga = substitui qualquer símbolo</div>
          <div>Cada curinga adiciona +50% ao prêmio</div>
        </div>
      </div>
    </div>
  ), []);

  return (
    <div className="slot-machine p-8 rounded-xl max-w-[800px] mx-auto backdrop-blur-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg">
          <Coins className="w-6 h-6 text-yellow-400" />
          <span className="text-yellow-400 text-xl">{balance}</span>
        </div>
        <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg">
          <Star className="w-6 h-6 text-purple-400" />
          <span className="text-purple-400 text-xl">Nível {level}</span>
        </div>
        <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <div className="flex flex-col">
            <span className="text-blue-400 text-sm">XP: {xp}/{nextLevelXp}</span>
            <div className="w-full h-2 bg-black/50 rounded-full">
              <div 
                className="h-full bg-blue-400 rounded-full transition-all"
                style={{ width: `${(xp / nextLevelXp) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg">
          <Gift className="w-6 h-6 text-green-400" />
          <span className="text-green-400 text-xl">Dia {loginStreak}/7</span>
        </div>
      </div>

      {multiplier === 1 && (
        <button
          onClick={activateMultiplier}
          disabled={balance < 500 || isSpinning}
          className="mb-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white flex items-center gap-2 mx-auto hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-5 h-5" />
          Ativar 2x (500 moedas)
        </button>
      )}

      {multiplier > 1 && (
        <div className="text-center mb-4 text-yellow-400 flex items-center justify-center gap-2">
          <Zap className="w-5 h-5" />
          Multiplicador {multiplier}x ativo!
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg">
          <Diamond className="w-6 h-6 text-purple-400" />
          <span className="text-purple-400 text-xl">{bet}</span>
        </div>
      </div>
      
      {lastWin > 0 && (
        <div className="text-green-400 text-2xl animate-bounce mb-6 flex items-center justify-center gap-2">
          <Crown className="w-6 h-6" />
          <span>+{lastWin}</span>
        </div>
      )}
      
      <div className="flex justify-center mb-8 gap-6">
        {reels.map((symbol, index) => (
          <SlotReel
            key={index}
            symbols={SYMBOLS}
            isSpinning={isSpinning}
            currentSymbol={symbol}
          />
        ))}
      </div>

      <div className="mb-6 bg-black/30 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-purple-300">Valor da Aposta</span>
          <span className="text-yellow-400 font-bold">{bet} moedas</span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="10"
            max={maxBet}
            step="10"
            value={bet}
            onChange={handleBetChange}
            disabled={isSpinning}
            className="w-full h-2 bg-indigo-900 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-indigo-600
              [&::-webkit-slider-thumb]:hover:bg-indigo-700
              [&::-webkit-slider-thumb]:transition-colors
              [&::-moz-range-thumb]:w-6
              [&::-moz-range-thumb]:h-6
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-indigo-600
              [&::-moz-range-thumb]:hover:bg-indigo-700
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:transition-colors"
          />
          
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>10</span>
            <span>50</span>
            <span>{maxBet}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg">
          <span className="text-purple-300">Jackpot:</span>
          <span className="text-yellow-400 text-xl">{jackpotAmount}</span>
        </div>
        <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg">
          <span className="text-purple-300">Sequência:</span>
          <span className="text-yellow-400 text-xl">{streak}x</span>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={isSpinning || balance < bet}
        className="spin-button w-full py-6 text-white rounded-lg text-2xl disabled:opacity-50 disabled:cursor-not-allowed font-bold tracking-wider"
      >
        {isSpinning ? 'SPINNING...' : 'SPIN!'}
      </button>

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <div className="mt-8 bg-black/30 p-4 rounded-lg">
          <h3 className="text-center text-xl mb-4 text-purple-300">Tabela de Prêmios</h3>
          {prizeTable}
        </div>

        <WinHistory history={winHistory} />
      </div>

      {maxWin > 0 && (
        <div className="mt-4 text-center text-sm text-purple-300">
          Maior prêmio: {maxWin} moedas
        </div>
      )}
    </div>
  );
};

export default SlotMachine;