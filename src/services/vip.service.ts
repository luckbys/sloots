import { toast } from 'sonner';

export interface VIPTier {
  id: string;
  name: string;
  level: number;
  requiredPoints: number;
  benefits: VIPBenefit[];
  icon: string;
  color: string;
}

export interface VIPBenefit {
  type: 'cashback' | 'dailyBonus' | 'withdrawalLimit' | 'support' | 'exclusive';
  description: string;
  value: number;
}

export interface VIPProgress {
  userId: string;
  currentPoints: number;
  currentTier: string;
  pointsToNextTier: number;
  cashbackPending: number;
  lastDailyBonus: Date | null;
}

class VIPService {
  private readonly tiers: VIPTier[] = [
    {
      id: 'bronze',
      name: 'Bronze',
      level: 1,
      requiredPoints: 0,
      benefits: [
        { type: 'cashback', description: 'Cashback em perdas', value: 0.5 },
        { type: 'dailyBonus', description: 'Bônus diário', value: 100 }
      ],
      icon: '🥉',
      color: '#CD7F32'
    },
    {
      id: 'silver',
      name: 'Prata',
      level: 2,
      requiredPoints: 1000,
      benefits: [
        { type: 'cashback', description: 'Cashback em perdas', value: 1 },
        { type: 'dailyBonus', description: 'Bônus diário', value: 250 },
        { type: 'withdrawalLimit', description: 'Limite de saque aumentado', value: 5000 }
      ],
      icon: '🥈',
      color: '#C0C0C0'
    },
    {
      id: 'gold',
      name: 'Ouro',
      level: 3,
      requiredPoints: 5000,
      benefits: [
        { type: 'cashback', description: 'Cashback em perdas', value: 2 },
        { type: 'dailyBonus', description: 'Bônus diário', value: 500 },
        { type: 'withdrawalLimit', description: 'Limite de saque aumentado', value: 10000 },
        { type: 'support', description: 'Suporte VIP prioritário', value: 1 }
      ],
      icon: '🥇',
      color: '#FFD700'
    },
    {
      id: 'diamond',
      name: 'Diamante',
      level: 4,
      requiredPoints: 20000,
      benefits: [
        { type: 'cashback', description: 'Cashback em perdas', value: 5 },
        { type: 'dailyBonus', description: 'Bônus diário', value: 1000 },
        { type: 'withdrawalLimit', description: 'Limite de saque aumentado', value: 50000 },
        { type: 'support', description: 'Suporte VIP dedicado', value: 2 },
        { type: 'exclusive', description: 'Acesso a jogos exclusivos', value: 1 }
      ],
      icon: '💎',
      color: '#B9F2FF'
    }
  ];

  private userProgress: Map<string, VIPProgress> = new Map();

  async getUserProgress(userId: string): Promise<VIPProgress> {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, {
        userId,
        currentPoints: 0,
        currentTier: 'bronze',
        pointsToNextTier: this.tiers[1].requiredPoints,
        cashbackPending: 0,
        lastDailyBonus: null
      });
    }
    return this.userProgress.get(userId)!;
  }

  async addPoints(userId: string, points: number): Promise<void> {
    const progress = await this.getUserProgress(userId);
    progress.currentPoints += points;

    // Atualiza o tier atual
    const newTier = this.tiers
      .slice()
      .reverse()
      .find(tier => progress.currentPoints >= tier.requiredPoints);

    if (newTier && newTier.id !== progress.currentTier) {
      progress.currentTier = newTier.id;
      toast.success(`Parabéns! Você alcançou o nível VIP ${newTier.name}! 🎉`, {
        description: 'Novos benefícios desbloqueados!'
      });
    }

    // Calcula pontos para o próximo tier
    const currentTierIndex = this.tiers.findIndex(t => t.id === progress.currentTier);
    const nextTier = this.tiers[currentTierIndex + 1];
    
    if (nextTier) {
      progress.pointsToNextTier = nextTier.requiredPoints - progress.currentPoints;
    } else {
      progress.pointsToNextTier = 0;
    }
  }

  async addCashbackPending(userId: string, lossAmount: number): Promise<void> {
    const progress = await this.getUserProgress(userId);
    const currentTier = this.tiers.find(t => t.id === progress.currentTier);
    if (!currentTier) return;

    const cashbackBenefit = currentTier.benefits.find(b => b.type === 'cashback');
    if (!cashbackBenefit) return;

    const cashbackAmount = (lossAmount * cashbackBenefit.value) / 100;
    progress.cashbackPending += cashbackAmount;
  }

  async claimCashback(userId: string): Promise<number> {
    const progress = await this.getUserProgress(userId);
    
    if (progress.cashbackPending <= 0) {
      toast.error('Não há cashback pendente para receber');
      return 0;
    }

    const amount = progress.cashbackPending;
    progress.cashbackPending = 0;
    toast.success(`Cashback de R$ ${amount.toFixed(2)} recebido com sucesso!`);
    return amount;
  }

  async claimDailyBonus(userId: string): Promise<number> {
    const progress = await this.getUserProgress(userId);
    const currentTier = this.tiers.find(t => t.id === progress.currentTier);
    if (!currentTier) return 0;

    const now = new Date();
    if (progress.lastDailyBonus && 
        progress.lastDailyBonus.getDate() === now.getDate()) {
      toast.error('Você já recebeu seu bônus diário hoje');
      return 0;
    }

    const bonusBenefit = currentTier.benefits.find(b => b.type === 'dailyBonus');
    if (!bonusBenefit) return 0;

    progress.lastDailyBonus = now;
    toast.success(`Bônus diário de R$ ${bonusBenefit.value.toFixed(2)} recebido!`);
    return bonusBenefit.value;
  }

  getTiers(): VIPTier[] {
    return this.tiers;
  }

  getCurrentTier(userId: string): VIPTier | null {
    const progress = this.userProgress.get(userId);
    if (!progress) return null;
    return this.tiers.find(t => t.id === progress.currentTier) || null;
  }
}

export const vipService = new VIPService(); 