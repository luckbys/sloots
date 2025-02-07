import { toast } from 'sonner';

export interface GameDifficulty {
  id: string;
  name: string;
  description: string;
  winRate: number;
  jackpotChance: number;
  minBet: number;
  maxBet: number;
  multipliers: number[];
  isActive: boolean;
}

export interface GameStats {
  totalSpins: number;
  totalWins: number;
  totalLosses: number;
  jackpotsHit: number;
  averageWin: number;
  biggestWin: number;
  currentWinStreak: number;
  maxWinStreak: number;
  totalPayout: number;
  totalBets: number;
  rtp: number;
}

export interface GameSettings {
  currentDifficulty: string;
  difficulties: GameDifficulty[];
  globalMultiplier: number;
  maxDailyLoss: number;
  maxDailyWin: number;
  maintenanceMode: boolean;
  jackpotMinValue: number;
  jackpotMaxValue: number;
  jackpotIncreaseRate: number;
  symbolWeights: Record<string, number>;
  payoutRates: Record<string, number>;
  bonusFrequency: number;
  maxMultiplier: number;
  volatility: 'low' | 'medium' | 'high';
  // Estatísticas do jogo
  totalPayout: number;
  totalBets: number;
  jackpotsHit: number;
  biggestWin: number;
  averageWin: number;
}

export class GameSettingsService {
  private settings: GameSettings = {
    currentDifficulty: 'normal',
    difficulties: [
      {
        id: 'easy',
        name: 'Fácil',
        description: 'Maior taxa de vitórias, prêmios menores',
        winRate: 0.6,
        jackpotChance: 0.001,
        minBet: 1,
        maxBet: 100,
        multipliers: [1.2, 1.5, 2, 3],
        isActive: true
      },
      {
        id: 'normal',
        name: 'Normal',
        description: 'Taxa de vitórias e prêmios equilibrados',
        winRate: 0.5,
        jackpotChance: 0.0005,
        minBet: 1,
        maxBet: 500,
        multipliers: [1.5, 2, 3, 5],
        isActive: true
      },
      {
        id: 'hard',
        name: 'Difícil',
        description: 'Menor taxa de vitórias, prêmios maiores',
        winRate: 0.4,
        jackpotChance: 0.0002,
        minBet: 1,
        maxBet: 1000,
        multipliers: [2, 3, 5, 10],
        isActive: true
      },
      {
        id: 'extreme',
        name: 'Extremo',
        description: 'Taxa de vitórias muito baixa, prêmios enormes',
        winRate: 0.3,
        jackpotChance: 0.0001,
        minBet: 10,
        maxBet: 5000,
        multipliers: [3, 5, 10, 20],
        isActive: false
      }
    ],
    globalMultiplier: 1,
    maxDailyLoss: 10000,
    maxDailyWin: 50000,
    maintenanceMode: false,
    jackpotMinValue: 5000,
    jackpotMaxValue: 1000000,
    jackpotIncreaseRate: 0.01,
    symbolWeights: {
      '7️⃣': 1,    // Jackpot
      '💎': 2,    // Premium
      '👑': 3,    // Alto
      '🌟': 4,    // Médio-alto
      '🎰': 5,    // Médio
      '🍒': 6,    // Médio-baixo
      '🍋': 7,    // Baixo
      '🃏': 8     // Curinga
    },
    payoutRates: {
      '7️⃣': 50,   // Jackpot
      '💎': 30,   // Premium
      '👑': 20,   // Alto
      '🌟': 15,   // Médio-alto
      '🎰': 10,   // Médio
      '🍒': 8,    // Médio-baixo
      '🍋': 5,    // Baixo
      '🃏': 3     // Curinga
    },
    bonusFrequency: 0.1,
    maxMultiplier: 100,
    volatility: 'medium',
    // Estatísticas do jogo
    totalPayout: 0,
    totalBets: 0,
    jackpotsHit: 0,
    biggestWin: 0,
    averageWin: 0
  };

  private statsTracking = {
    totalSpins: 0,
    totalWins: 0,
    totalLosses: 0,
    jackpotsHit: 0,
    averageWin: 0,
    biggestWin: 0,
    currentWinStreak: 0,
    maxWinStreak: 0,
    totalPayout: 0,
    totalBets: 0,
    rtp: 0
  };

  async getSettings(): Promise<GameSettings> {
    return this.settings;
  }

  async updateSettings(newSettings: Partial<GameSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    this.validateSettings();
    toast.success('Configurações atualizadas com sucesso!');
  }

  async updateDifficulty(difficultyId: string, updates: Partial<GameDifficulty>): Promise<void> {
    const difficulty = this.settings.difficulties.find(d => d.id === difficultyId);
    if (!difficulty) {
      toast.error('Dificuldade não encontrada');
      return;
    }

    Object.assign(difficulty, updates);
    this.validateSettings();
    toast.success('Dificuldade atualizada com sucesso!');
  }

  async setCurrentDifficulty(difficultyId: string): Promise<void> {
    const difficulty = this.settings.difficulties.find(d => d.id === difficultyId);
    if (!difficulty) {
      toast.error('Dificuldade não encontrada');
      return;
    }

    if (!difficulty.isActive) {
      toast.error('Esta dificuldade está desativada');
      return;
    }

    this.settings.currentDifficulty = difficultyId;
    toast.success(`Dificuldade alterada para ${difficulty.name}`);
  }

  async toggleMaintenance(enabled: boolean): Promise<void> {
    this.settings.maintenanceMode = enabled;
    toast.success(`Modo de manutenção ${enabled ? 'ativado' : 'desativado'}`);
  }

  async updateSymbolWeights(weights: Record<string, number>): Promise<void> {
    this.settings.symbolWeights = weights;
    this.validateSettings();
    toast.success('Pesos dos símbolos atualizados');
  }

  async updatePayoutRates(rates: Record<string, number>): Promise<void> {
    this.settings.payoutRates = rates;
    this.validateSettings();
    toast.success('Taxas de pagamento atualizadas');
  }

  private validateSettings(): void {
    // Validações básicas
    if (this.settings.globalMultiplier <= 0) {
      this.settings.globalMultiplier = 1;
    }

    if (this.settings.maxDailyWin <= this.settings.maxDailyLoss) {
      this.settings.maxDailyWin = this.settings.maxDailyLoss * 2;
    }

    // Validação de pesos dos símbolos
    const totalWeight = Object.values(this.settings.symbolWeights).reduce((a, b) => a + b, 0);
    if (totalWeight === 0) {
      Object.keys(this.settings.symbolWeights).forEach(key => {
        this.settings.symbolWeights[key] = 1;
      });
    }

    // Validação de taxas de pagamento
    Object.values(this.settings.payoutRates).forEach(rate => {
      if (rate < 0) rate = 0;
    });
  }

  async getStats(): Promise<GameStats> {
    // Simular chamada à API
    return {
      totalSpins: 1000,
      totalWins: 450,
      totalLosses: 550,
      jackpotsHit: 5,
      averageWin: 150.75,
      biggestWin: 5000,
      currentWinStreak: 3,
      maxWinStreak: 8,
      totalPayout: 75000,
      totalBets: 100000,
      rtp: 75
    };
  }

  async trackSpin(bet: number, win: number, isJackpot: boolean): Promise<void> {
    this.statsTracking.totalSpins++;
    this.statsTracking.totalBets += bet;
    
    if (win > 0) {
      this.statsTracking.totalWins++;
      this.statsTracking.totalPayout += win;
      this.statsTracking.currentWinStreak++;
      this.statsTracking.maxWinStreak = Math.max(
        this.statsTracking.maxWinStreak,
        this.statsTracking.currentWinStreak
      );
      this.statsTracking.averageWin = this.statsTracking.totalPayout / this.statsTracking.totalWins;
      this.statsTracking.biggestWin = Math.max(this.statsTracking.biggestWin, win);
      
      if (isJackpot) {
        this.statsTracking.jackpotsHit++;
      }
    } else {
      this.statsTracking.totalLosses++;
      this.statsTracking.currentWinStreak = 0;
    }
  }

  async resetStats(): Promise<void> {
    Object.keys(this.statsTracking).forEach(key => {
      (this.statsTracking as any)[key] = 0;
    });
    toast.success('Estatísticas resetadas com sucesso!');
  }
}

export const gameSettingsService = new GameSettingsService(); 