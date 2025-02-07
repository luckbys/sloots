import { createContext, useContext, FC, ReactNode } from 'react';
import { User, AuthState } from '../types/auth';
import { AuthService } from '../services/auth.service';
import { useAuthState } from '../hooks/useAuthState';
import { toast } from 'sonner';

interface AuthContextType extends Omit<AuthState, 'loading'> {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { state, setLoading, setUser, handleAuthError } = useAuthState();

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user, token } = await AuthService.login(email, password);
      AuthService.setAuthData(token, user);
      setUser(user);
      toast.success(`Bem-vindo, ${user.name}!`, {
        description: user.role === 'admin' ? 'Acesso administrativo concedido' : 'Login realizado com sucesso'
      });
    } catch (error) {
      handleAuthError(error, 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const { user, token } = await AuthService.register(name, email, password);
      AuthService.setAuthData(token, user);
      setUser(user);
      toast.success('Conta criada com sucesso!');
    } catch (error) {
      handleAuthError(error, 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      AuthService.clearAuthData();
      setUser(null);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      handleAuthError(error, 'Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      setLoading(true);
      const updatedUser = await AuthService.updateUser(data);
      AuthService.setAuthData(AuthService.getStoredToken()!, updatedUser);
      setUser(updatedUser);
      if ('balance' in data) {
        toast.success('Saldo atualizado!');
      } else {
        toast.success('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      handleAuthError(error, 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user: state.user,
      error: state.error,
      isLoading: state.loading,
      login,
      logout,
      register,
      updateUser,
      isAdmin: state.user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 