import { FC, useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import SlotReel from './SlotReel';
import {
  Coins,
  ChevronUp,
  ChevronDown,
  Crown,
  Diamond,
  Star,
  Gift,
  Zap,
  TrendingUp,
  Trophy,
  Settings,
  Volume2,
  VolumeX,
  Clock,
  BarChart2
} from 'lucide-react';
import WinHistory, { WinRecord } from './WinHistory';
import { formatCurrency } from '../utils/format';
import Confetti from './Confetti';
import { useSound } from '../hooks/useSound';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShareButton from '@/components/ShareButton';
import { generateShareMessage } from '../utils/share';
import AutoplayControls from './AutoplayControls';
import { useAuth } from '../contexts/AuthContext';
import WinRecordItem from './WinRecordItem';
import PrizeTable from './PrizeTable';
import GameRules from './GameRules';
import SpinParticles from './SpinParticles';

const SYMBOLS = ['🍒', '7️⃣', '🎰', '💎', '🌟', '🍋', '👑', '🃏'] as const;
type Symbol = (typeof SYMBOLS)[number];

const INITIAL_BALANCE = 100; // R$100 inicial
const SPIN_DURATION = 3000;
const MIN_BET = 1;
const MAX_BET = 100;

const symbolConfig: Record<Symbol, { multiplier: number; weight: number }> = {
  '7️⃣': { multiplier: 50, weight: 1 },    // Jackpot
  '💎': { multiplier: 30, weight: 2 },    // Premium
  '👑': { multiplier: 20, weight: 3 },    // Alto
  '🌟': { multiplier: 15, weight: 4 },    // Médio-alto
  '🎰': { multiplier: 10, weight: 5 },    // Médio
  '🍒': { multiplier: 8, weight: 6 },     // Médio-baixo
  '🍋': { multiplier: 5, weight: 7 },     // Baixo
  '🃏': { multiplier: 3, weight: 8 }      // Curinga
};

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

// Adicionar novas constantes
const MULTIPLIER_LEVELS = {
  1: { requirement: 0, value: 1 },
  2: { requirement: 3, value: 1.2 },  // 3 vitórias seguidas
  3: { requirement: 5, value: 1.5 },  // 5 vitórias seguidas
  4: { requirement: 7, value: 2 },    // 7 vitórias seguidas
  5: { requirement: 10, value: 3 }    // 10 vitórias seguidas
} as const;

const ACHIEVEMENTS = {
  firstWin: { id: 'firstWin', title: 'Primeira Vitória', xp: 100 },
  bigWinner: { id: 'bigWinner', title: 'Grande Vencedor', xp: 500 },
  jackpotHunter: { id: 'jackpotHunter', title: 'Caçador de Jackpots', xp: 1000 },
  luckyStreak: { id: 'luckyStreak', title: 'Sorte Grande', xp: 2000 }
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

interface AutoplayConfig {
  active: boolean;
  maxSpins: number;
  currentSpins: number;
}

const SlotMachine: FC = () => {
  const { user, updateUser } = useAuth();
  const { play, toggleBackground, isInitialized, isLoaded } = useSound();
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<Symbol[][]>([
    [SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]],
    [SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]],
    [SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]
  ]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winHistory, setWinHistory] = useState<WinRecord[]>([]);
  const [jackpot, setJackpot] = useState(5000);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bet, setBet] = useState(MIN_BET);
  const [autoplayConfig, setAutoplayConfig] = useState<AutoplayConfig>({
    active: false,
    maxSpins: 50,
    currentSpins: 0
  });
  const [stats, setStats] = useState({
    totalSpins: 0,
    winRate: 0,
    biggestWin: 0,
    lastWin: 0,
    streak: 0,
    maxStreak: 0
  });

  // Adicionar novos estados
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [achievements, setAchievements] = useState<Set<string>>(new Set());
  const [lastWinAmount, setLastWinAmount] = useState(0);

  const isWildcard = useCallback((symbol: string) => symbol === '🃏', []);

  const generateNewReels = useCallback((): Symbol[][] => {
    return Array.from({ length: 3 }, () => 
      Array.from({ length: 3 }, () => 
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      )
    );
  }, []);

  // Efeito para controlar música de fundo
  useEffect(() => {
    if (soundEnabled && isInitialized && isLoaded?.background) {
      toggleBackground(true);
    } else {
      toggleBackground(false);
    }
  }, [soundEnabled, isInitialized, isLoaded?.background]);

  // Função para tocar som
  const playSound = useCallback((soundName: 'spin' | 'win' | 'jackpot' | 'click') => {
    if (soundEnabled && isLoaded?.[soundName]) {
      play(soundName).catch(error => {
        console.warn(`Erro ao tocar som ${soundName}:`, error);
      });
    }
  }, [soundEnabled, play, isLoaded]);

  const maxBet = useMemo(() => Math.min(100, user?.balance || 100), [user?.balance]);

  // Calcular XP necessário para o próximo nível
  const nextLevelXp = useMemo(() => {
    return Math.floor(LEVEL_XP_BASE * Math.pow(LEVEL_MULTIPLIER, user?.level || 1 - 1));
  }, [user?.level]);

  // Função para gerar mensagem de compartilhamento
  const generateShareMessage = useCallback((win: number, isJackpot: boolean) => {
    const messages = {
      jackpot: [
        '🎰 JACKPOT INCRÍVEL! 🎉',
        `Acabei de ganhar ${formatCurrency(win)} no Sloots!`,
        '🎲 Venha tentar a sua sorte também!'
      ],
      bigWin: [
        '🎰 Grande Vitória! 💰',
        `Ganhei ${formatCurrency(win)} no Sloots!`,
        '🎲 Tente sua sorte você também!'
      ],
      normal: [
        '🎰 Nova Vitória! ✨',
        `Ganhei ${formatCurrency(win)} jogando Sloots!`,
        '🎲 Venha jogar também!'
      ]
    };

    if (isJackpot) return messages.jackpot.join('\n');
    if (win >= 100) return messages.bigWin.join('\n');
    return messages.normal.join('\n');
  }, []);

  // Função para atualizar o multiplicador baseado na sequência de vitórias
  const updateMultiplier = useCallback((streak: number) => {
    const newLevel = Object.entries(MULTIPLIER_LEVELS)
      .reverse()
      .find(([_, { requirement }]) => streak >= requirement);
    
    if (newLevel) {
      const [level, { value }] = newLevel;
      setCurrentMultiplier(value);
      if (value > 1) {
        toast.success(`🔥 Multiplicador ${value}x ativado!`, {
          description: `Mantenha a sequência para aumentar o multiplicador!`
        });
      }
    }
  }, []);

  // Função para verificar e conceder conquistas
  const checkAchievements = useCallback((win: number, isJackpot: boolean) => {
    const newAchievements = new Set(achievements);
    let xpGained = 0;

    if (!achievements.has('firstWin')) {
      newAchievements.add('firstWin');
      xpGained += ACHIEVEMENTS.firstWin.xp;
      toast.success('🏆 Conquista Desbloqueada!', {
        description: ACHIEVEMENTS.firstWin.title
      });
    }

    if (win >= 1000 && !achievements.has('bigWinner')) {
      newAchievements.add('bigWinner');
      xpGained += ACHIEVEMENTS.bigWinner.xp;
      toast.success('🏆 Conquista Desbloqueada!', {
        description: ACHIEVEMENTS.bigWinner.title
      });
    }

    if (isJackpot && !achievements.has('jackpotHunter')) {
      newAchievements.add('jackpotHunter');
      xpGained += ACHIEVEMENTS.jackpotHunter.xp;
      toast.success('🏆 Conquista Desbloqueada!', {
        description: ACHIEVEMENTS.jackpotHunter.title
      });
    }

    if (stats.streak >= 5 && !achievements.has('luckyStreak')) {
      newAchievements.add('luckyStreak');
      xpGained += ACHIEVEMENTS.luckyStreak.xp;
      toast.success('🏆 Conquista Desbloqueada!', {
        description: ACHIEVEMENTS.luckyStreak.title
      });
    }

    if (xpGained > 0) {
      setAchievements(newAchievements);
      if (user) {
        updateUser({
          xp: (user.xp || 0) + xpGained
        });
      }
    }
  }, [achievements, stats.streak, user, updateUser]);

  // Validar aposta quando o saldo mudar
  useEffect(() => {
    if (user && bet > user.balance) {
      setBet(Math.min(MIN_BET, user.balance));
    }
  }, [user?.balance]);

  // Melhorar a função checkWin
  const checkWin = useCallback((newReels: string[]) => {
    if (!user || !newReels || newReels.length !== 3) return;
    
    let winAmount = 0;
    let isJackpot = false;

    try {
      const symbolsEqual = newReels.every((symbol, _, arr) => 
        symbol === arr[0] || isWildcard(symbol) || isWildcard(arr[0])
      );

      if (symbolsEqual) {
        const baseSymbol = newReels.find(s => !isWildcard(s)) || newReels[0];
        const prizeMultiplier = symbolConfig[baseSymbol as keyof typeof symbolConfig].multiplier || 1;
        
        const wildcardCount = newReels.filter(isWildcard).length;
        const wildcardBonus = wildcardCount * 0.5;
        
        winAmount = Math.floor(bet * prizeMultiplier * (1 + wildcardBonus) * currentMultiplier);

        if (newReels.every(s => s === '7️⃣')) {
          winAmount += jackpot;
          isJackpot = true;
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          setJackpot(5000);
        }
      } 
      else if (
        newReels[0] === newReels[1] || 
        newReels[1] === newReels[2] || 
        newReels[0] === newReels[2] ||
        newReels.filter(isWildcard).length >= 1
      ) {
        winAmount = Math.floor(bet * 1.5 * currentMultiplier);
      }

      if (winAmount > 0) {
        setLastWinAmount(winAmount);
        
        // Atualizar usuário com o ganho
        updateUser({
          ...user,
          balance: user.balance + winAmount,
          totalWins: (user.totalWins || 0) + 1,
          maxWin: Math.max(user.maxWin || 0, winAmount)
        });

        setStats(prev => {
          const newStreak = prev.streak + 1;
          return {
            ...prev,
            totalSpins: prev.totalSpins + 1,
            winRate: ((prev.totalSpins * prev.winRate + 100) / (prev.totalSpins + 1)),
            biggestWin: Math.max(prev.biggestWin, winAmount),
            lastWin: winAmount,
            streak: newStreak,
            maxStreak: Math.max(prev.maxStreak, newStreak)
          };
        });

        // Atualizar multiplicador baseado na nova sequência
        updateMultiplier(stats.streak + 1);

        // Verificar conquistas
        checkAchievements(winAmount, isJackpot);

        const newRecord: WinRecord = {
          id: nanoid(),
          amount: winAmount,
          symbols: [...newReels],
          timestamp: new Date(),
          isJackpot
        };
        
        setWinHistory(prev => [newRecord, ...prev].slice(0, 10));
        
        if (soundEnabled) {
          playSound('win');
        }

        const message = isJackpot
          ? `🎉 MEGA JACKPOT! ${formatCurrency(winAmount)}! 🎉`
          : `🎉 Você ganhou ${formatCurrency(winAmount)}!`;

        toast.success(message, {
          duration: isJackpot ? 5000 : 2000,
        });
      } else {
        setStats(prev => ({
          ...prev,
          totalSpins: prev.totalSpins + 1,
          streak: 0
        }));
        setCurrentMultiplier(1);
      }
    } catch (error) {
      console.error('Erro ao verificar vitória:', error);
      toast.error('Ocorreu um erro ao verificar o resultado');
    }
  }, [bet, jackpot, isWildcard, currentMultiplier, soundEnabled, play, user, updateUser, stats.streak, checkAchievements, updateMultiplier]);

  // Melhorar a função spin
  const spin = useCallback(() => {
    try {
      if (!user) {
        toast.error("Usuário não encontrado!");
        return;
      }
      
      if (user.balance < bet) {
        toast.error("Saldo insuficiente!");
        return;
      }
      
      if (isSpinning) return;

      // Deduzir a aposta do saldo do usuário
      updateUser({
        ...user,
        balance: user.balance - bet,
        totalSpins: (user.totalSpins || 0) + 1
      });
      
      setIsSpinning(true);
      playSound('spin');

      // Gerar novos símbolos
      const newReels = generateNewReels();
      
      // Simular a animação
      setTimeout(() => {
        setReels(newReels);
        setIsSpinning(false);
        // Pegar o símbolo do meio de cada reel para verificar vitória
        const middleSymbols = newReels.map(reel => reel[1]);
        checkWin(middleSymbols);
      }, SPIN_DURATION);
    } catch (error) {
      console.error('Erro ao girar:', error);
      toast.error('Ocorreu um erro ao girar');
      setIsSpinning(false);
    }
  }, [user, updateUser, bet, isSpinning, checkWin, playSound, generateNewReels]);

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
        localStorage.setItem('loginStreak', String(newStreak));
        
        const bonus = DAILY_BONUS[newStreak as keyof typeof DAILY_BONUS];
        updateUser({
          balance: user?.balance + bonus
        });
        toast.success(`🎁 Bônus diário: +${formatCurrency(bonus)}! (Dia ${newStreak})`);
      } else {
        // Quebrou a sequência
        localStorage.setItem('loginStreak', '1');
        updateUser({
          balance: user?.balance + DAILY_BONUS[1]
        });
        toast.success(`🎁 Bônus diário: +${formatCurrency(DAILY_BONUS[1])}!`);
      }

      localStorage.setItem('lastLoginDate', today);
    }
  }, [user, updateUser]);

  // Sistema de multiplicador temporário
  const activateMultiplier = useCallback(() => {
    if (user?.balance >= 50) { // Custo do multiplicador ajustado para R$50
      updateUser({
        balance: user.balance - 50
      });
      toast.success('🔥 Multiplicador 2x ativado por 5 jogadas!');
    } else {
      toast.error('Saldo insuficiente para ativar o multiplicador!');
    }
  }, [user, updateUser]);

  const handleBetChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (value > 0 && value <= user?.balance || 0) {
      setBet(value);
    }
  }, [user?.balance]);

  const handleQuickBet = useCallback((amount: number) => {
    if (amount <= user?.balance || 0) {
      setBet(amount);
    }
  }, [user?.balance]);

  const handleMaxBet = useCallback(() => {
    setBet(user?.balance || 0);
  }, [user?.balance]);

  const prizeTable = useMemo(() => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="text-yellow-400 mb-2">Três Iguais:</h4>
        {Object.entries(symbolConfig).map(([symbol, { multiplier }]) => (
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

  // Ativar música de fundo quando o componente montar
  useEffect(() => {
    if (isInitialized) {
      toggleBackground(true);
    }
    return () => toggleBackground(false);
  }, [isInitialized]);

  const handleAutoplayStart = useCallback((spins: number) => {
    setAutoplayConfig({
      active: true,
      maxSpins: spins,
      currentSpins: 0
    });
  }, []);

  const handleAutoplayStop = useCallback(() => {
    setAutoplayConfig(prev => ({
      ...prev,
      active: false
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f2e] to-[#0d0619] relative overflow-hidden">
      {/* Efeito de brilho de fundo */}
      <div className="absolute inset-0 bg-[url('/patterns/noise.png')] opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"></div>

      <Confetti active={showConfetti} />
      
      <div className="relative p-4 space-y-6 container mx-auto max-w-7xl">
        {/* Cabeçalho */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-black/40 border-2 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)] backdrop-blur-sm hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all">
            <div className="p-4">
              <Label className="text-sm text-yellow-500/80">Saldo</Label>
              <div className="text-2xl font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]">
                R$ {user?.balance?.toFixed(2) || '0.00'}
              </div>
              {lastWinAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-green-400 font-bold drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                >
                  +{formatCurrency(lastWinAmount)}
                </motion.div>
              )}
            </div>
          </Card>

          <Card className="bg-black/40 border-2 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] backdrop-blur-sm hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
            <div className="p-4">
              <Label className="text-sm text-purple-500/80">Nível {user?.level || 1}</Label>
              <Progress value={((user?.xp || 0) % 1000) / 10} className="h-2 bg-purple-950 border border-purple-500/20" />
              <div className="flex justify-between text-xs text-purple-400">
                <span>{user?.xp || 0} XP</span>
                <span>{1000 - ((user?.xp || 0) % 1000)} XP para o próximo nível</span>
              </div>
            </div>
          </Card>

          <Card className="bg-black/40 border-2 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)] backdrop-blur-sm hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all">
            <div className="p-4">
              <Label className="text-sm text-green-500/80">Sequência de Vitórias</Label>
              <div className="text-2xl font-bold text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]">
                {stats.streak}x
              </div>
              {currentMultiplier > 1 && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-sm text-yellow-400 font-bold drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]"
                >
                  Multiplicador {currentMultiplier}x
                </motion.div>
              )}
            </div>
          </Card>

          <Card className="bg-black/40 border-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] backdrop-blur-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
            <div className="p-4">
              <Label className="text-sm text-blue-500/80">Conquistas</Label>
              <div className="text-2xl font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                {achievements.size}/{Object.keys(ACHIEVEMENTS).length}
              </div>
              <div className="text-xs text-blue-400/80">
                Próxima: {
                  Object.values(ACHIEVEMENTS).find(a => !achievements.has(a.id))?.title || 'Todas completadas!'
                }
              </div>
            </div>
          </Card>
        </div>

        {/* Área Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controles */}
          <Card className="bg-black/40 border-2 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] backdrop-blur-sm">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-purple-400 font-semibold">Valor da Aposta</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="text-3xl font-bold text-center py-3 px-6 bg-black/40 rounded-lg border-2 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                      R$ {bet.toFixed(2)}
                      {currentMultiplier > 1 && (
                        <span className="text-lg text-yellow-400 ml-2 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]">
                          (x{currentMultiplier})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <input
                    type="range"
                    min={MIN_BET}
                    max={Math.min(MAX_BET, user?.balance || MAX_BET)}
                    value={bet}
                    onChange={handleBetChange}
                    disabled={isSpinning}
                    className="w-full h-3 bg-purple-950 rounded-lg appearance-none cursor-pointer
                      border border-purple-500/30
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-6
                      [&::-webkit-slider-thumb]:h-6
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-gradient-to-r
                      [&::-webkit-slider-thumb]:from-purple-500
                      [&::-webkit-slider-thumb]:to-purple-600
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:border-2
                      [&::-webkit-slider-thumb]:border-purple-300
                      [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(168,85,247,0.5)]
                      [&::-webkit-slider-thumb]:transition-all
                      [&::-webkit-slider-thumb]:hover:shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                  />
                  
                  <div className="flex justify-between text-xs text-purple-400/80">
                    <span>Min: R$ {MIN_BET}</span>
                    <span>Max: R$ {Math.min(MAX_BET, user?.balance || MAX_BET)}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[10, 25, 50, 100].map(value => (
                      <Button
                        key={value}
                        variant="outline"
                        size="sm"
                        onClick={() => setBet(Math.min(value, user?.balance || value))}
                        disabled={isSpinning || (user?.balance || 0) < value}
                        className="text-xs bg-black/20 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all"
                      >
                        R$ {value}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <PrizeTable bet={bet} symbols={symbolConfig} />
                <GameRules />
              </div>

              <div className="flex justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="hover:bg-purple-500/20"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <AutoplayControls
                isActive={autoplayConfig.active}
                remainingSpins={autoplayConfig.maxSpins - autoplayConfig.currentSpins}
                totalSpins={autoplayConfig.maxSpins}
                onStart={handleAutoplayStart}
                onStop={handleAutoplayStop}
                disabled={isSpinning}
              />
            </div>
          </Card>

          {/* Slot Machine */}
          <Card className="md:col-span-2 bg-black/40 border-2 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)] backdrop-blur-sm">
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-8 bg-black/60 p-6 rounded-xl border border-purple-500/30">
                {reels.map((reel, i) => (
                  <SlotReel
                    key={i}
                    symbols={Array.from(SYMBOLS)}
                    isSpinning={isSpinning}
                    currentSymbols={reel}
                    delay={i * 100}
                  />
                ))}
              </div>

              <div className="flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full max-w-xs relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
                  <Button
                    size="lg"
                    onClick={spin}
                    disabled={isSpinning || (user?.balance || 0) < bet}
                    className={`
                      w-full py-6 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl
                      text-black text-2xl font-black uppercase tracking-wider
                      shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105
                      border-4 border-yellow-400 disabled:hover:scale-100
                      ${isSpinning ? 'animate-pulse' : ''}
                      relative overflow-hidden
                    `}
                  >
                    <SpinParticles isSpinning={isSpinning} />
                    {isSpinning ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <span className="relative">
                          <span className="absolute inset-0 animate-ping">⭐</span>
                          <span>GIRANDO...</span>
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <span className="relative inline-flex items-center gap-2">
                          {currentMultiplier > 1 && (
                            <motion.span
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute -left-8 text-black text-base font-bold bg-yellow-300 px-2 py-1 rounded-full"
                            >
                              {currentMultiplier}x
                            </motion.span>
                          )}
                          <span>GIRAR!</span>
                          <motion.span
                            animate={{ 
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="inline-block"
                          >
                            🎰
                          </motion.span>
                        </span>
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </Card>
        </div>

        {/* Histórico */}
        <Card className="bg-black/40 border-2 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] backdrop-blur-sm">
          <div className="p-4">
            <Label className="text-lg text-purple-400 mb-4 block font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Histórico de Vitórias
            </Label>
            <div className="space-y-2">
              {winHistory.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Nenhuma vitória registrada ainda
                </div>
              ) : (
                winHistory.map(record => (
                  <WinRecordItem key={record.id} record={record} />
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

WinRecordItem.displayName = 'WinRecordItem';

export default SlotMachine;