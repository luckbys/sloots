export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  balance: number;
  level: number;
  xp: number;
  createdAt: Date;
  lastLogin: Date;
  loginStreak: number;
  maxWin: number;
  totalWins: number;
  totalSpins: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthError {
  message: string;
  code: string;
} 