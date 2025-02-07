export interface WinRecord {
  id: string;
  amount: number;
  symbols: string[];
  timestamp: Date;
  isJackpot: boolean;
  shareMessage: {
    title: string;
    text: string;
  };
  level: number;
  streak: number;
  maxWin: number;
} 