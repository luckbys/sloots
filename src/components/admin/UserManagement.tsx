import { FC, useState, useEffect } from 'react';
import { User } from '../../types/auth';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Ban,
  UserCheck,
  Gift,
  TrendingUp,
  Clock,
  DollarSign,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface UserStats {
  totalSpins: number;
  winRate: number;
  lastLogin: Date;
  balance: number;
  suspiciousActivity: boolean;
}

interface ExtendedUser extends User {
  stats: UserStats;
  isBanned: boolean;
}

const UserManagement: FC = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Simulação de chamada à API
      const mockUsers: ExtendedUser[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Usuário ${i + 1}`,
        email: `usuario${i + 1}@example.com`,
        role: 'user',
        balance: Math.floor(Math.random() * 10000),
        level: Math.floor(Math.random() * 50) + 1,
        xp: Math.floor(Math.random() * 1000),
        createdAt: new Date(),
        lastLogin: new Date(),
        loginStreak: Math.floor(Math.random() * 7) + 1,
        maxWin: Math.floor(Math.random() * 5000),
        totalWins: Math.floor(Math.random() * 100),
        totalSpins: Math.floor(Math.random() * 1000),
        stats: {
          totalSpins: Math.floor(Math.random() * 1000),
          winRate: Math.random(),
          lastLogin: new Date(),
          balance: Math.floor(Math.random() * 10000),
          suspiciousActivity: Math.random() > 0.8
        },
        isBanned: Math.random() > 0.9
      }));
      setUsers(mockUsers);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isBanned: !user.isBanned } : user
      ));
      toast.success('Status do usuário atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar status do usuário');
    }
  };

  const handleSendBonus = async (userId: string, amount: number) => {
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(users.map(user => 
        user.id === userId ? { ...user, balance: user.balance + amount } : user
      ));
      toast.success(`Bônus de R$ ${amount} enviado com sucesso!`);
    } catch (error) {
      toast.error('Erro ao enviar bônus');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Barra de Pesquisa */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-purple-500/20 rounded-lg
              text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchUsers}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg flex items-center gap-2"
        >
          <Users className="w-5 h-5" />
          Atualizar Lista
        </motion.button>
      </div>

      {/* Lista de Usuários */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Users className="w-8 h-8 text-purple-400" />
            </motion.div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Nenhum usuário encontrado
          </div>
        ) : (
          filteredUsers.map(user => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${
                user.isBanned
                  ? 'bg-red-500/10 border-red-500/30'
                  : user.stats.suspiciousActivity
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-black/20 border-purple-500/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{user.name}</span>
                    {user.isBanned && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                        Banido
                      </span>
                    )}
                    {user.stats.suspiciousActivity && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                        Suspeito
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{user.email}</div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBanUser(user.id)}
                    className={`p-2 rounded-lg ${
                      user.isBanned
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {user.isBanned ? <UserCheck className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSendBonus(user.id, 100)}
                    className="p-2 bg-green-500/20 text-green-400 rounded-lg"
                  >
                    <Gift className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Estatísticas do Usuário */}
              <div className="mt-4 grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Saldo</div>
                  <div className="font-bold text-green-400">
                    R$ {user.balance.toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Taxa de Vitória</div>
                  <div className="font-bold text-blue-400">
                    {(user.stats.winRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Total de Jogadas</div>
                  <div className="font-bold text-purple-400">
                    {user.stats.totalSpins}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Nível</div>
                  <div className="font-bold text-yellow-400">
                    {user.level}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserManagement; 