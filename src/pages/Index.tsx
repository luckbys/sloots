import { FC } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SlotMachine from '../components/SlotMachine';

const Index: FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // Será redirecionado pelo ProtectedRoute
  }

  return <SlotMachine />;
};

export default Index;