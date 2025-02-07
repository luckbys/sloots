import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useProtectedRoute = (requireAdmin = false) => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/login');
      } else if (requireAdmin && !isAdmin) {
        navigate('/');
      }
    }
  }, [user, isLoading, isAdmin, navigate, requireAdmin]);

  return { isLoading, user, isAdmin };
}; 