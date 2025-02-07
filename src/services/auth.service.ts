import { User } from '../types/auth';
import { API_ROUTES } from '../config/api';

export class AuthService {
  private static TOKEN_KEY = 'auth_token';
  private static USER_KEY = 'user';

  static getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getStoredUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  static setAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Simulação de API para desenvolvimento
  static async mockAuthDelay(data: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return data;
  }

  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Simulação de login
    const isAdmin = email === 'admin@sloots.com' && password === 'admin123';
    
    const mockUser: User = {
      id: '1',
      name: isAdmin ? 'Administrador' : 'Usuário',
      email,
      role: isAdmin ? 'admin' : 'user',
      balance: 1000,
      level: 1,
      xp: 0,
      createdAt: new Date(),
      lastLogin: new Date(),
      loginStreak: 1,
      maxWin: 0,
      totalWins: 0,
      totalSpins: 0
    };

    const mockToken = `mock-token-${Date.now()}`;
    
    return this.mockAuthDelay({ user: mockUser, token: mockToken });
  }

  static async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const mockUser: User = {
      id: '1',
      name,
      email,
      role: 'user',
      balance: 1000,
      level: 1,
      xp: 0,
      createdAt: new Date(),
      lastLogin: new Date(),
      loginStreak: 1,
      maxWin: 0,
      totalWins: 0,
      totalSpins: 0
    };

    const mockToken = `mock-token-${Date.now()}`;
    
    return this.mockAuthDelay({ user: mockUser, token: mockToken });
  }

  static async updateUser(data: Partial<User>): Promise<User> {
    const currentUser = this.getStoredUser();
    if (!currentUser) throw new Error('Usuário não encontrado');

    const updatedUser = { ...currentUser, ...data };
    return this.mockAuthDelay(updatedUser);
  }

  static async verifyToken(token: string): Promise<User> {
    const user = this.getStoredUser();
    if (!user) throw new Error('Token inválido');
    return this.mockAuthDelay(user);
  }
} 