import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import SlotReel from './SlotReel';
import { Coins, ChevronUp, ChevronDown, Crown, Diamond, Star, Gift, Zap, TrendingUp, Trophy } from 'lucide-react';
import WinHistory, { WinRecord } from './WinHistory';
import { formatCurrency } from '../utils/format';


const SYMBOLS = ['🍒', '7️⃣', '🎰', '💎', '🌟', '🍋', '👑', '🃏'] as const;
const INITIAL_BALANCE = 100; // R$100 inicial
const SPIN_DURATION = 2000;

const PRIZES = {
  '7️⃣': 50,    // Jackpot
  '💎': 30,    // Premium
  '👑': 20,    // Alto
  '🌟': 15,    // Médio-alto
  '🎰': 10,    // Médio
  '🍒': 8,     // Médio-baixo
  '🍋': 5,     // Baixo
  '🃏': 3,     // Curinga
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
  1: 10,     // Dia 1: R$10
  2: 15,     // Dia 2: R$15
  3: 20,     // Dia 3: R$20
  4: 25,     // Dia 4: R$25
  5: 30,     // Dia 5: R$30
  6: 40,     // Dia 6: R$40
  7: 50,     // Dia 7: R$50
} as const;

// Prevenir erros de áudio
const playAudio = async (audio: HTMLAudioElement) => {
  try {
    audio.currentTime = 0;
    await audio.play();
  } catch (error) {
    console.warn('Erro ao tocar áudio:', error);
  }
};

const SlotMachine = () => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [bet, setBet] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[]>(['7️⃣', '7️⃣', '7️⃣']);
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

  // Melhorar a função de play sound
  const playSound = useCallback((type: keyof typeof AUDIO) => {
    playAudio(AUDIO[type]);
  }, []);

  const maxBet = useMemo(() => Math.min(100, balance), [balance]);

  // Calcular XP necessário para o próximo nível
  const nextLevelXp = useMemo(() => {
    return Math.floor(LEVEL_XP_BASE * Math.pow(LEVEL_MULTIPLIER, level - 1));
  }, [level]);

  // Corrigir a função checkWin para evitar cálculos incorretos
  const checkWin = useCallback((newReels: string[]) => {
    if (!newReels || newReels.length !== 3) return;
    
    let winAmount = 0;
    let xpGained = 0;
    let message = '';
    let isJackpot = false;

    try {
      const symbolsEqual = newReels.every((symbol, _, arr) => 
        symbol === arr[0] || isWildcard(symbol) || isWildcard(arr[0])
      );

      if (symbolsEqual) {
        const baseSymbol = newReels.find(s => !isWildcard(s)) || newReels[0];
        const prizeMultiplier = PRIZES[baseSymbol as keyof typeof PRIZES] || 1;
        
        const wildcardCount = newReels.filter(isWildcard).length;
        const wildcardBonus = wildcardCount * 0.5;
        
        winAmount = Math.floor(bet * prizeMultiplier * (1 + wildcardBonus));

        if (newReels.every(s => s === '7️⃣')) {
          winAmount += jackpotAmount;
          isJackpot = true;
          message = `🎉 MEGA JACKPOT! Você ganhou ${formatCurrency(winAmount)}! 🎉`;
          setJackpotAmount(5000);
        } else {
          message = `🎉 Você ganhou ${formatCurrency(winAmount)}! 🎉`;
        }
      } 
      else if (
        newReels[0] === newReels[1] || 
        newReels[1] === newReels[2] || 
        newReels[0] === newReels[2] ||
        newReels.filter(isWildcard).length >= 1
      ) {
        winAmount = Math.floor(bet * 1.5);
        message = `Você ganhou ${formatCurrency(winAmount)}!`;
      }

      if (winAmount > 0) {
        const finalWinAmount = Math.floor(winAmount * multiplier);
        xpGained = Math.floor(finalWinAmount * 0.1);
        
        // Agrupar atualizações de estado
        setBalance(prev => prev + finalWinAmount);
        setLastWin(finalWinAmount);
        setMaxWin(prev => Math.max(prev, finalWinAmount));
        setStreak(prev => prev + 1);
        
        const newXp = xp + xpGained;
        if (newXp >= nextLevelXp) {
          const bonusCoins = level * 100;
          setLevel(prev => prev + 1);
          setXp(newXp - nextLevelXp);
          setBalance(prev => prev + bonusCoins);
          toast.success(`🌟 Level Up! Nível ${level + 1}! Bônus: +${formatCurrency(bonusCoins)}!`);
        } else {
          setXp(newXp);
        }

        // Criar novo registro com ID único
        const newRecord: WinRecord = {
          id: nanoid(),
          amount: finalWinAmount,
          symbols: [...newReels], // Clone do array para evitar referências
          timestamp: new Date(),
          isJackpot
        };
        
        setWinHistory(prev => [newRecord, ...prev].slice(0, 10));
        playSound(isJackpot ? 'jackpot' : 'win');
        
        toast.success(message, {
          duration: isJackpot ? 5000 : 2000,
        });

        // Atualizar multiplicador se necessário
        if (multiplier > 1) {
          setMultiplier(prev => {
            if (prev === 2) {
              toast.info('Multiplicador 2x terminou!');
              return 1;
            }
            return prev;
          });
        }
      } else {
        setStreak(0);
      }
    } catch (error) {
      console.error('Erro ao verificar vitória:', error);
      toast.error('Ocorreu um erro ao verificar o resultado');
    }
  }, [bet, multiplier, xp, level, nextLevelXp, jackpotAmount, isWildcard, playSound]);

  // Melhorar a função spin
  const spin = useCallback(() => {
    try {
      if (balance < bet) {
        toast.error("Saldo insuficiente!");
        return;
      }
      if (isSpinning) return;

      // Deduzir a aposta imediatamente
      setBalance(prev => prev - bet);
      setLastWin(0);
      setIsSpinning(true);

      // Gerar novos símbolos
      const newReels = Array.from({ length: 3 }, () => 
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      );

      // Simular a animação
      setTimeout(() => {
        setReels(newReels);
        setIsSpinning(false);
        checkWin(newReels);
      }, SPIN_DURATION);
    } catch (error) {
      console.error('Erro ao girar:', error);
      setIsSpinning(false);
      toast.error('Ocorreu um erro ao girar');
    }
  }, [balance, bet, isSpinning]);

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
        toast.success(`🎁 Bônus diário: +${formatCurrency(bonus)}! (Dia ${newStreak})`);
      } else {
        // Quebrou a sequência
        setLoginStreak(1);
        localStorage.setItem('loginStreak', '1');
        setBalance(prev => prev + DAILY_BONUS[1]);
        toast.success(`🎁 Bônus diário: +${formatCurrency(DAILY_BONUS[1])}!`);
      }

      localStorage.setItem('lastLoginDate', today);
      setLastLoginDate(today);
    }
  }, []);

  // Sistema de multiplicador temporário
  const activateMultiplier = useCallback(() => {
    if (balance >= 50) { // Custo do multiplicador ajustado para R$50
      setBalance(prev => prev - 50);
      setMultiplier(2);
      toast.success('🔥 Multiplicador 2x ativado por 5 jogadas!');
    } else {
      toast.error('Saldo insuficiente para ativar o multiplicador!');
    }
  }, [balance]);

  const handleBetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBet = parseInt(event.target.value);
    if (newBet <= balance && newBet >= 1) {
      setBet(newBet);
      playSound('click');
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

  useEffect(() => {
    let spinTimeout: NodeJS.Timeout;

    const handleSpin = () => {
      if (isSpinning) {
        spinTimeout = setTimeout(() => {
          setIsSpinning(false);
        }, SPIN_DURATION);
      }
    };

    handleSpin();

    return () => {
      if (spinTimeout) {
        clearTimeout(spinTimeout);
      }
    };
  }, [isSpinning]);

  return (
    <div className="slot-machine min-h-screen p-4 flex flex-col bg-gradient-to-b from-purple-900/50 to-indigo-900/50">
      {/* Cabeçalho com informações */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-black/40 p-3 rounded-xl border-2 border-yellow-500/30 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-500" />
            <span className="text-yellow-400 text-xl font-bold">{formatCurrency(balance)}</span>
          </div>
        </div>
        
        <div className="bg-black/40 p-3 rounded-xl border-2 border-purple-500/30 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-purple-400" />
            <span className="text-purple-400 text-xl font-bold">Nível {level}</span>
          </div>
        </div>

        <div className="bg-black/40 p-3 rounded-xl border-2 border-green-500/30 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-green-400" />
            <span className="text-green-400 text-xl font-bold">Dia {loginStreak}/7</span>
          </div>
        </div>

        <div className="bg-black/40 p-3 rounded-xl border-2 border-pink-500/30 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-pink-300 font-bold">Jackpot:</span>
            <span className="text-pink-400 text-xl font-bold">{formatCurrency(jackpotAmount)}</span>
          </div>
        </div>
      </div>

      {/* Área principal */}
      <div className="flex-1 grid grid-cols-5 gap-6">
        {/* Área do jogo */}
        <div className="col-span-3 flex flex-col">
          <div className="bg-black/40 p-6 rounded-xl border-2 border-indigo-500/30 shadow-lg backdrop-blur-sm flex-1 flex flex-col">
            {/* XP Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400">XP: {xp}/{nextLevelXp}</span>
                <span className="text-blue-400">{Math.floor((xp / nextLevelXp) * 100)}%</span>
              </div>
              <div className="w-full h-1 bg-black/50 rounded-full">
                <div 
                  className="h-full bg-blue-400 rounded-full transition-all"
                  style={{ width: `${(xp / nextLevelXp) * 100}%` }}
                />
              </div>
            </div>

            {/* Multiplicador */}
            {multiplier === 1 ? (
              <button
                onClick={activateMultiplier}
                disabled={balance < 50 || isSpinning}
                className="mb-6 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg text-black font-bold
                  shadow-[0_0_10px_rgba(234,179,8,0.3)] hover:shadow-[0_0_15px_rgba(234,179,8,0.5)]
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105
                  border-2 border-yellow-400"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>2x (R$50)</span>
                </div>
              </button>
            ) : (
              <div className="text-center mb-6 text-yellow-400 text-xl font-bold flex items-center justify-center gap-2
                animate-pulse">
                <Zap className="w-6 h-6" />
                {multiplier}x ATIVO!
              </div>
            )}

            {/* Último ganho */}
            {lastWin > 0 && (
              <div className="text-green-400 text-xl animate-bounce mb-4 text-center">
                +{formatCurrency(lastWin)}
              </div>
            )}

            {/* Slots */}
            <div className="flex justify-center gap-6 mb-8">
              {reels.map((symbol, index) => (
                <SlotReel
                  key={index}
                  symbols={[...SYMBOLS]}
                  isSpinning={isSpinning}
                  currentSymbol={symbol}
                />
              ))}
            </div>

            {/* Controles */}
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg text-purple-300 font-bold">Aposta:</span>
                <span className="text-lg text-yellow-400 font-bold">{formatCurrency(bet)}</span>
              </div>

              <div className="relative mb-6">
                <input
                  type="range"
                  min="1"
                  max={Math.min(50, balance)}
                  step="1"
                  value={bet}
                  onChange={handleBetChange}
                  disabled={isSpinning}
                  className="w-full h-3 bg-black/60 rounded-lg appearance-none cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/30
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-6
                    [&::-webkit-slider-thumb]:h-6
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-yellow-500
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-yellow-600
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:hover:bg-yellow-400
                    [&::-webkit-slider-thumb]:transition-colors"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-400 font-bold">
                  <span>R$1</span>
                  <span>R$25</span>
                  <span>R${Math.min(50, balance)}</span>
                </div>
              </div>

              {/* Botão de Spin */}
              <button
                onClick={spin}
                disabled={isSpinning || balance < bet}
                className="w-full py-6 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl
                  text-black text-2xl font-black uppercase tracking-wider
                  shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105
                  border-4 border-yellow-400 disabled:hover:scale-100"
              >
                {isSpinning ? 'GIRANDO...' : 'GIRAR!'}
              </button>
            </div>
          </div>
        </div>

        {/* Coluna da direita - Histórico e Prêmios */}
        <div className="col-span-2 grid grid-rows-2 gap-4 h-full">
          {/* Histórico */}
          <div className="bg-black/30 p-4 rounded-lg overflow-hidden">
            <h3 className="text-purple-300 text-sm mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Histórico
            </h3>
            <div className="h-[calc(100%-2rem)] overflow-y-auto custom-scrollbar">
              <WinHistory history={winHistory} />
            </div>
          </div>

          {/* Tabela de Prêmios */}
          <div className="bg-black/30 p-4 rounded-lg overflow-hidden">
            <h3 className="text-purple-300 text-sm mb-2">Prêmios</h3>
            <div className="h-[calc(100%-2rem)] overflow-y-auto custom-scrollbar text-xs">
              {prizeTable}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;