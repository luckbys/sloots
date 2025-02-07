import { FC, useState } from 'react';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import AdminPanel from '../components/admin/AdminPanel';
import UserManagement from '../components/admin/UserManagement';
import TransactionManagement from '../components/admin/TransactionManagement';
import RewardManagement from '../components/admin/RewardManagement';
import { Users, Activity, Settings, DollarSign, Gift, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

type TabType = 'dashboard' | 'users' | 'transactions' | 'rewards' | 'settings';

const Admin: FC = () => {
  const { isLoading, isAdmin } = useProtectedRoute(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900/50 to-indigo-900/50 
        flex items-center justify-center">
        <div className="text-2xl text-purple-400">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900/50 to-indigo-900/50 
        flex items-center justify-center">
        <div className="text-2xl text-red-400">Acesso Negado</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminPanel />;
      case 'users':
        return <UserManagement />;
      case 'transactions':
        return <TransactionManagement />;
      case 'rewards':
        return <RewardManagement />;
      case 'settings':
        return <div>Configurações em desenvolvimento...</div>;
      default:
        return <AdminPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/50 to-indigo-900/50">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-purple-400 mb-8">Painel Administrativo</h1>

        {/* Tabs de Navegação */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <TabButton
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            icon={<BarChart2 />}
            label="Dashboard"
          />
          <TabButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={<Users />}
            label="Usuários"
          />
          <TabButton
            active={activeTab === 'transactions'}
            onClick={() => setActiveTab('transactions')}
            icon={<Activity />}
            label="Transações"
          />
          <TabButton
            active={activeTab === 'rewards'}
            onClick={() => setActiveTab('rewards')}
            icon={<Gift />}
            label="Recompensas"
          />
          <TabButton
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon={<Settings />}
            label="Configurações"
          />
        </div>

        {/* Conteúdo */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

// Componentes auxiliares
const TabButton: FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap
      ${active
        ? 'bg-purple-500 text-white'
        : 'bg-black/20 text-gray-300 hover:bg-purple-500/20'
      }`}
  >
    {icon}
    <span>{label}</span>
  </motion.button>
);

const QuickActionButton: FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-2 px-4 py-2 bg-purple-500/20
      rounded-lg text-purple-300 hover:bg-purple-500/30 transition-colors"
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StatItem: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-300">{label}</span>
    <span className="text-yellow-400 font-bold">{value}</span>
  </div>
);

export default Admin; 