import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Gift,
  Star,
  Trophy,
  Calendar,
  Users,
  Plus,
  Edit,
  Trash,
  RefreshCw
} from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'achievement' | 'special' | 'level';
  amount: number;
  requiredLevel?: number;
  requiredStreak?: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

const RewardManagement: FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setIsLoading(true);
      // Simulação de chamada à API
      const mockRewards: Reward[] = [
        {
          id: '1',
          title: 'Bônus Diário',
          description: 'Receba moedas todos os dias ao fazer login',
          type: 'daily',
          amount: 100,
          isActive: true
        },
        {
          id: '2',
          title: 'Conquista: Primeiro Jackpot',
          description: 'Ganhe um bônus ao conseguir seu primeiro jackpot',
          type: 'achievement',
          amount: 500,
          isActive: true
        },
        {
          id: '3',
          title: 'Bônus de Nível 10',
          description: 'Recompensa por atingir o nível 10',
          type: 'level',
          amount: 1000,
          requiredLevel: 10,
          isActive: true
        },
        {
          id: '4',
          title: 'Evento de Natal',
          description: 'Bônus especial de Natal',
          type: 'special',
          amount: 2000,
          startDate: new Date('2024-12-24'),
          endDate: new Date('2024-12-26'),
          isActive: false
        }
      ];

      setRewards(mockRewards);
    } catch (error) {
      toast.error('Erro ao carregar recompensas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReward = async () => {
    try {
      const newReward: Reward = {
        id: `${Date.now()}`,
        title: 'Nova Recompensa',
        description: 'Descrição da nova recompensa',
        type: 'daily',
        amount: 100,
        isActive: true
      };

      setRewards([...rewards, newReward]);
      setSelectedReward(newReward);
      setIsEditing(true);
      toast.success('Nova recompensa criada!');
    } catch (error) {
      toast.error('Erro ao criar recompensa');
    }
  };

  const handleUpdateReward = async (reward: Reward) => {
    try {
      setRewards(rewards.map(r => r.id === reward.id ? reward : r));
      setSelectedReward(null);
      setIsEditing(false);
      toast.success('Recompensa atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar recompensa');
    }
  };

  const handleDeleteReward = async (id: string) => {
    try {
      setRewards(rewards.filter(r => r.id !== id));
      toast.success('Recompensa excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir recompensa');
    }
  };

  const getTypeIcon = (type: Reward['type']) => {
    switch (type) {
      case 'daily':
        return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'special':
        return <Star className="w-5 h-5 text-purple-400" />;
      case 'level':
        return <Users className="w-5 h-5 text-green-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-purple-400">Sistema de Recompensas</h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateReward}
            className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Recompensa
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchRewards}
            className="p-2 bg-purple-500 text-white rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Lista de Recompensas */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Gift className="w-8 h-8 text-purple-400" />
            </motion.div>
          </div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Nenhuma recompensa cadastrada
          </div>
        ) : (
          rewards.map(reward => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${
                reward.isActive
                  ? 'bg-black/20 border-purple-500/20'
                  : 'bg-black/10 border-gray-500/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {getTypeIcon(reward.type)}
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {reward.title}
                      {!reward.isActive && (
                        <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{reward.description}</div>
                    <div className="mt-2 text-sm">
                      <span className="text-green-400">R$ {reward.amount.toFixed(2)}</span>
                      {reward.requiredLevel && (
                        <span className="ml-2 text-blue-400">Nível {reward.requiredLevel}</span>
                      )}
                      {reward.requiredStreak && (
                        <span className="ml-2 text-yellow-400">{reward.requiredStreak} dias seguidos</span>
                      )}
                      {reward.startDate && reward.endDate && (
                        <span className="ml-2 text-purple-400">
                          {new Date(reward.startDate).toLocaleDateString()} até {new Date(reward.endDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedReward(reward);
                      setIsEditing(true);
                    }}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"
                  >
                    <Edit className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteReward(reward.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg"
                  >
                    <Trash className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal de Edição (simplificado) */}
      {isEditing && selectedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 p-6 rounded-lg w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-purple-400 mb-4">
              {selectedReward.id === 'new' ? 'Nova Recompensa' : 'Editar Recompensa'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Título</label>
                <input
                  type="text"
                  value={selectedReward.title}
                  onChange={(e) => setSelectedReward({ ...selectedReward, title: e.target.value })}
                  className="w-full px-3 py-2 bg-black/20 border border-purple-500/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                <textarea
                  value={selectedReward.description}
                  onChange={(e) => setSelectedReward({ ...selectedReward, description: e.target.value })}
                  className="w-full px-3 py-2 bg-black/20 border border-purple-500/20 rounded-lg text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Valor</label>
                  <input
                    type="number"
                    value={selectedReward.amount}
                    onChange={(e) => setSelectedReward({ ...selectedReward, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/20 border border-purple-500/20 rounded-lg text-white"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                  <select
                    value={selectedReward.type}
                    onChange={(e) => setSelectedReward({ ...selectedReward, type: e.target.value as Reward['type'] })}
                    className="w-full px-3 py-2 bg-black/20 border border-purple-500/20 rounded-lg text-white"
                  >
                    <option value="daily">Diário</option>
                    <option value="achievement">Conquista</option>
                    <option value="special">Especial</option>
                    <option value="level">Nível</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedReward(null);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUpdateReward(selectedReward)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg"
                >
                  Salvar
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RewardManagement; 