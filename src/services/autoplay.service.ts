import { toast } from 'sonner';

export interface AutoplayConfig {
  userId: string;
  active: boolean;
  maxSpins: number;
  currentSpins: number;
  baseAmount: number;
  stopConditions: {
    onSingleWin?: number;
    onTotalWin?: number;
    onTotalLoss?: number;
    onBalanceIncrease?: number;
    onBalanceDecrease?: number;
  };
  strategy: {
    type: 'fixed' | 'martingale' | 'reverse_martingale' | 'fibonacci';
    onWin: 'continue' | 'reset' | 'stop';
    onLoss: 'continue' | 'reset' | 'stop';
    multiplier?: number;
  };
}

class AutoplayService {
  private configs: Map<string, AutoplayConfig> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  getDefaultConfig(userId: string): AutoplayConfig {
    return {
      userId,
      active: false,
      maxSpins: 50,
      currentSpins: 0,
      baseAmount: 1,
      stopConditions: {
        onSingleWin: 1000,
        onTotalLoss: 100
      },
      strategy: {
        type: 'fixed',
        onWin: 'continue',
        onLoss: 'continue'
      }
    };
  }

  async getConfig(userId: string): Promise<AutoplayConfig> {
    if (!this.configs.has(userId)) {
      this.configs.set(userId, this.getDefaultConfig(userId));
    }
    return this.configs.get(userId)!;
  }

  async updateConfig(userId: string, config: Partial<AutoplayConfig>): Promise<void> {
    const currentConfig = await this.getConfig(userId);
    this.configs.set(userId, { ...currentConfig, ...config });
  }

  async start(userId: string): Promise<void> {
    const config = await this.getConfig(userId);
    
    if (config.active) {
      toast.error('Autoplay já está ativo');
      return;
    }

    config.active = true;
    config.currentSpins = 0;
    
    // Simulação do autoplay
    const interval = setInterval(() => {
      this.processSpin(userId);
    }, 2000);

    this.intervals.set(userId, interval);
    toast.success('Autoplay iniciado!');
  }

  async stop(userId: string): Promise<void> {
    const config = await this.getConfig(userId);
    
    if (!config.active) {
      return;
    }

    config.active = false;
    const interval = this.intervals.get(userId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(userId);
    }

    toast.success('Autoplay parado!');
  }

  private async processSpin(userId: string): Promise<void> {
    const config = await this.getConfig(userId);
    
    if (!config.active || config.currentSpins >= config.maxSpins) {
      this.stop(userId);
      return;
    }

    config.currentSpins++;

    // Simulação de resultado
    const win = Math.random() > 0.5;
    const amount = win ? config.baseAmount * 2 : 0;

    // Verifica condições de parada
    if (win && config.stopConditions.onSingleWin && amount >= config.stopConditions.onSingleWin) {
      toast.success('Autoplay parado: Ganho único atingido!');
      this.stop(userId);
      return;
    }

    // Atualiza estratégia
    if (config.strategy.type !== 'fixed') {
      this.updateBetAmount(config, win);
    }
  }

  private updateBetAmount(config: AutoplayConfig, win: boolean): void {
    const multiplier = config.strategy.multiplier || 2;

    switch (config.strategy.type) {
      case 'martingale':
        if (win) {
          if (config.strategy.onWin === 'reset') {
            config.baseAmount = this.getDefaultConfig(config.userId).baseAmount;
          }
        } else {
          if (config.strategy.onLoss === 'continue') {
            config.baseAmount *= multiplier;
          }
        }
        break;

      case 'reverse_martingale':
        if (win) {
          if (config.strategy.onWin === 'continue') {
            config.baseAmount *= multiplier;
          }
        } else {
          if (config.strategy.onLoss === 'reset') {
            config.baseAmount = this.getDefaultConfig(config.userId).baseAmount;
          }
        }
        break;

      case 'fibonacci':
        // Implementação da sequência de Fibonacci
        const sequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
        const currentIndex = sequence.findIndex(n => n === config.baseAmount);
        
        if (win) {
          if (config.strategy.onWin === 'reset') {
            config.baseAmount = sequence[0];
          } else if (currentIndex > 0) {
            config.baseAmount = sequence[currentIndex - 1];
          }
        } else {
          if (config.strategy.onLoss === 'continue' && currentIndex < sequence.length - 1) {
            config.baseAmount = sequence[currentIndex + 1];
          }
        }
        break;
    }
  }

  isActive(userId: string): boolean {
    return this.configs.get(userId)?.active || false;
  }
}

export const autoplayService = new AutoplayService(); 