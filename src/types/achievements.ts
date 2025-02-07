export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'spin' | 'win' | 'jackpot' | 'streak' | 'level' | 'login';
  requirement: number;
  progress: number;
  completed: boolean;
  reward: number;
  icon: string;
}

export interface AchievementProgress {
  userId: string;
  achievementId: string;
  currentProgress: number;
  completedAt?: Date;
  rewardClaimed: boolean;
}

export const ACHIEVEMENTS: Omit<Achievement, 'progress' | 'completed'>[] = [
  {
    id: 'first_win',
    title: 'Primeira Vitória',
    description: 'Ganhe sua primeira rodada',
    type: 'win',
    requirement: 1,
    reward: 100,
    icon: '🎉'
  },
  {
    id: 'spin_master',
    title: 'Mestre das Rodadas',
    description: 'Faça 1000 rodadas',
    type: 'spin',
    requirement: 1000,
    reward: 500,
    icon: '🎰'
  },
  {
    id: 'jackpot_hunter',
    title: 'Caçador de Jackpots',
    description: 'Ganhe 3 jackpots',
    type: 'jackpot',
    requirement: 3,
    reward: 1000,
    icon: '💰'
  },
  {
    id: 'lucky_streak',
    title: 'Sorte Grande',
    description: 'Mantenha uma sequência de 10 vitórias',
    type: 'streak',
    requirement: 10,
    reward: 2000,
    icon: '🔥'
  },
  {
    id: 'high_roller',
    title: 'Alto Apostador',
    description: 'Faça uma aposta de 1000 moedas',
    type: 'spin',
    requirement: 1000,
    reward: 5000,
    icon: '💎'
  }
]; 