import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface RouteGuardOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const useRouteGuard = (options: RouteGuardOptions = {}) => {
  const { requireAuth = true, requireAdmin = false, redirectTo = '/login' } = options;
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !user) {
      toast.error('Acesso negado', {
        description: 'Você precisa estar logado para acessar esta página'
      });
      navigate(redirectTo, { state: { from: location } });
      return;
    }

    if (requireAdmin && !isAdmin) {
      toast.error('Acesso negado', {
        description: 'Você não tem permissão para acessar esta página'
      });
      navigate('/', { state: { from: location } });
      return;
    }
  }, [user, isAdmin, isLoading, navigate, location, requireAuth, requireAdmin, redirectTo]);

  return { isLoading, user, isAdmin };
}; 