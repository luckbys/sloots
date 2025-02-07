import { FC, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  DollarSign,
  Gift,
  Settings,
  TrendingUp,
  Clock,
  Award,
  AlertTriangle,
  Ban,
  UserPlus,
  RefreshCw,
  RotateCw,
  Shield,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import UserManagement from './UserManagement';

interface AdminStats {
  totalUsers: number;
  totalSpins: number;
  totalWins: number;
  totalLosses: number;
  averageWinRate: number;
  jackpotHits: number;
  onlineUsers: number;
  dailyActiveUsers: number;
  totalDeposits: number;
  totalWithdraws: number;
  suspiciousActivities: number;
  activeUsers: number;
  totalRevenue: number;
  avgSessionTime: number;
  jackpotAmount: number;
}

interface AdminAction {
  id: string;
  type: 'jackpot_reset' | 'bonus_sent' | 'user_banned' | 'settings_changed' | 'bonus' | 'ban' | 'user_warning';
  description: string;
  timestamp: Date;
  performedBy: string;
}

const AdminPanel: FC = () => {
  const { isAdmin, user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActions, setRecentActions] = useState<AdminAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'transactions' | 'settings'>('overview');
  const [jackpotAmount, setJackpotAmount] = useState(5000);
  const [bonusAmount, setBonusAmount] = useState(100);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchRecentActions();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      // Simulação de chamada à API
      const mockStats: AdminStats = {
        totalUsers: 1234,
        totalSpins: 50000,
        totalWins: 25000,
        totalLosses: 25000,
        averageWinRate: 0.5,
        jackpotHits: 3,
        onlineUsers: 42,
        dailyActiveUsers: 156,
        totalDeposits: 10000,
        totalWithdraws: 5000,
        suspiciousActivities: 5,
        activeUsers: 100,
        totalRevenue: 50000,
        avgSessionTime: 30,
        jackpotAmount: 5000
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActions = async () => {
    try {
      // Simulação de chamada à API
      const mockActions: AdminAction[] = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        type: ['jackpot_reset', 'bonus_sent', 'user_banned', 'settings_changed', 'bonus', 'ban', 'user_warning'][Math.floor(Math.random() * 7)] as AdminAction['type'],
        description: `Ação administrativa ${i + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        performedBy: 'Admin'
      }));
      setRecentActions(mockActions);
    } catch (error) {
      toast.error('Erro ao carregar ações recentes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetJackpot = async () => {
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setJackpotAmount(5000);
      toast.success('Jackpot resetado com sucesso!');
      fetchRecentActions();
    } catch (error) {
      toast.error('Erro ao resetar jackpot');
    }
  };

  const handleSendBonus = async () => {
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Bônus de R$ ${bonusAmount} enviado para todos os usuários!`);
      fetchRecentActions();
    } catch (error) {
      toast.error('Erro ao enviar bônus');
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Usuário banido com sucesso!');
      fetchRecentActions();
    } catch (error) {
      toast.error('Erro ao banir usuário');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-xl">Acesso negado</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas e Notificações */}
      {stats?.suspiciousActivities > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span>Existem {stats.suspiciousActivities} atividades suspeitas para revisar!</span>
          </div>
        </motion.div>
      )}

      {/* Navegação */}
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedTab('overview')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            selectedTab === 'overview'
              ? 'bg-purple-500 text-white'
              : 'bg-black/20 text-gray-400 hover:text-white'
          }`}
        >
          <Shield className="w-5 h-5" />
          Visão Geral
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedTab('users')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            selectedTab === 'users'
              ? 'bg-purple-500 text-white'
              : 'bg-black/20 text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          Usuários
        </motion.button>
      </div>

      {selectedTab === 'overview' ? (
        <>
          {/* Estatísticas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Usuários Online"
              value={stats?.onlineUsers || 0}
              icon={<Users className="w-5 h-5" />}
              trend={+15}
            />
            <StatCard
              title="Jogadas Hoje"
              value={stats?.totalSpins || 0}
              icon={<TrendingUp className="w-5 h-5" />}
              trend={+250}
            />
            <StatCard
              title="Jackpots"
              value={stats?.jackpotHits || 0}
              icon={<Award className="w-5 h-5" />}
              trend={+1}
            />
            <StatCard
              title="Taxa de Vitória"
              value={`${(stats?.averageWinRate || 0) * 100}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              trend={-2.5}
            />
          </div>

          {/* Ações Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction
              title="Resetar Jackpot"
              description="Define o valor do jackpot para R$ 5.000"
              icon={<RotateCw className="w-5 h-5" />}
              onClick={handleResetJackpot}
            />
            <QuickAction
              title="Enviar Bônus Global"
              description="Envia um bônus para todos os usuários"
              icon={<Gift className="w-5 h-5" />}
              onClick={handleSendBonus}
            />
            <QuickAction
              title="Configurações do Jogo"
              description="Ajusta as configurações do caça-níquel"
              icon={<Settings className="w-5 h-5" />}
              onClick={() => setSelectedTab('settings')}
            />
          </div>

          {/* Ações Recentes */}
          <div className="bg-black/20 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-purple-400 mb-4">Ações Recentes</h3>
            <div className="space-y-2">
              {recentActions.map(action => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-2 bg-black/20 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {action.type === 'jackpot_reset' && <RefreshCw className="w-4 h-4 text-blue-400" />}
                    {action.type === 'bonus_sent' && <Gift className="w-4 h-4 text-green-400" />}
                    {action.type === 'user_banned' && <Ban className="w-4 h-4 text-red-400" />}
                    <span className="text-sm text-gray-300">{action.description}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(action.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <UserManagement />
      )}
    </div>
  );
};

// Componentes auxiliares
const StatCard: FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend: number;
}> = ({ title, value, icon, trend }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-black/20 p-4 rounded-lg border border-purple-500/20"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-400 text-sm">{title}</span>
      {icon}
    </div>
    <div className="text-2xl font-bold text-white mb-2">{value}</div>
    <div className={`text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
      {trend > 0 ? '+' : ''}{trend}% desde ontem
    </div>
  </motion.div>
);

const QuickAction: FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="p-4 bg-black/20 rounded-lg border border-purple-500/20 text-left"
  >
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="font-bold text-purple-400">{title}</span>
    </div>
    <p className="text-sm text-gray-400">{description}</p>
  </motion.button>
);

export default AdminPanel; 