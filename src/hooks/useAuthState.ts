import { useState, useCallback } from 'react';
import { User, AuthState } from '../types/auth';
import { AuthService } from '../services/auth.service';
import { toast } from 'sonner';

export const useAuthState = () => {
  const [state, setState] = useState<AuthState>(() => ({
    user: AuthService.getStoredUser(),
    loading: false,
    error: null
  }));

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, user, error: null }));
  }, []);

  const handleAuthError = useCallback((error: any, defaultMessage: string) => {
    console.error('Erro de autenticação:', error);
    setError(error.message || defaultMessage);
    toast.error('Erro', {
      description: error.message || defaultMessage
    });
  }, [setError]);

  return {
    state,
    setLoading,
    setError,
    setUser,
    handleAuthError
  };
}; 