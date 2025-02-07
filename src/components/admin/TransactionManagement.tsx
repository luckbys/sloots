import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdraw' | 'win' | 'loss' | 'bonus';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  description: string;
}

const TransactionManagement: FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Transaction['type'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Transaction['status'] | 'all'>('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      // Simulação de chamada à API
      const mockTransactions: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
        id: `${i + 1}`,
        userId: `user-${Math.floor(Math.random() * 10) + 1}`,
        userName: `Usuário ${Math.floor(Math.random() * 10) + 1}`,
        type: ['deposit', 'withdraw', 'win', 'loss', 'bonus'][Math.floor(Math.random() * 5)] as Transaction['type'],
        amount: Math.floor(Math.random() * 1000) + 10,
        status: ['pending', 'completed', 'failed'][Math.floor(Math.random() * 3)] as Transaction['status'],
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
        description: 'Transação automática'
      }));

      setTransactions(mockTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    } catch (error) {
      toast.error('Erro ao carregar transações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTransaction = async (id: string) => {
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(transactions.map(transaction =>
        transaction.id === id ? { ...transaction, status: 'completed' } : transaction
      ));
      toast.success('Transação aprovada com sucesso!');
    } catch (error) {
      toast.error('Erro ao aprovar transação');
    }
  };

  const handleRejectTransaction = async (id: string) => {
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(transactions.map(transaction =>
        transaction.id === id ? { ...transaction, status: 'failed' } : transaction
      ));
      toast.success('Transação rejeitada com sucesso!');
    } catch (error) {
      toast.error('Erro ao rejeitar transação');
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filter === 'all' || transaction.type === filter;
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case 'withdraw':
        return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case 'win':
        return <DollarSign className="w-4 h-4 text-yellow-400" />;
      case 'loss':
        return <DollarSign className="w-4 h-4 text-red-400" />;
      case 'bonus':
        return <DollarSign className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuário ou ID..."
            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-purple-500/20 rounded-lg
              text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Filtros */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Transaction['type'] | 'all')}
          className="px-4 py-2 bg-black/20 border border-purple-500/20 rounded-lg text-white"
        >
          <option value="all">Todos os tipos</option>
          <option value="deposit">Depósitos</option>
          <option value="withdraw">Saques</option>
          <option value="win">Ganhos</option>
          <option value="loss">Perdas</option>
          <option value="bonus">Bônus</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Transaction['status'] | 'all')}
          className="px-4 py-2 bg-black/20 border border-purple-500/20 rounded-lg text-white"
        >
          <option value="all">Todos os status</option>
          <option value="pending">Pendentes</option>
          <option value="completed">Concluídos</option>
          <option value="failed">Falhos</option>
        </select>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchTransactions}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Atualizar
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            toast.success('Relatório exportado com sucesso!');
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Exportar
        </motion.button>
      </div>

      {/* Lista de Transações */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-8 h-8 text-purple-400" />
            </motion.div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Nenhuma transação encontrada
          </div>
        ) : (
          filteredTransactions.map(transaction => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-black/20 border border-purple-500/20 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getTypeIcon(transaction.type)}
                  <div>
                    <div className="font-bold text-white">{transaction.userName}</div>
                    <div className="text-sm text-gray-400">ID: {transaction.id}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`font-bold ${
                      ['deposit', 'win', 'bonus'].includes(transaction.type)
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      {['deposit', 'win', 'bonus'].includes(transaction.type) ? '+' : '-'}
                      R$ {transaction.amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-sm ${
                    transaction.status === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : transaction.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {transaction.status === 'completed' ? 'Concluído' :
                     transaction.status === 'pending' ? 'Pendente' : 'Falhou'}
                  </div>

                  {transaction.status === 'pending' && (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApproveTransaction(transaction.id)}
                        className="p-2 bg-green-500/20 text-green-400 rounded-lg"
                      >
                        Aprovar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRejectTransaction(transaction.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg"
                      >
                        Rejeitar
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionManagement; 