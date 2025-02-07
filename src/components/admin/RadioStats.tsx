import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Music,
  Clock,
  TrendingUp,
  Plus,
  Play,
  BarChart3,
  Users,
  Repeat
} from 'lucide-react';
import type { RadioStats as RadioStatsType } from '../../types/radio';
import { radioService } from '../../services/radio.service';

const RadioStats: FC = () => {
  const [stats, setStats] = useState<RadioStatsType | null>(null);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    setStats(radioService.getStats());
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-black/20 p-6 rounded-lg h-32" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Faixas',
      value: stats.totalTracks.toString(),
      icon: <Music className="w-5 h-5" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Tempo Total',
      value: formatDuration(stats.totalPlayTime),
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Faixa Mais Tocada',
      value: stats.mostPlayedTrack?.title || 'N/A',
      subValue: stats.mostPlayedTrack ? `${stats.mostPlayedTrack.playCount} reproduções` : '',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      title: 'Última Adição',
      value: stats.lastAddedTrack?.title || 'N/A',
      subValue: stats.lastAddedTrack ? `por ${stats.lastAddedTrack.addedBy}` : '',
      icon: <Plus className="w-5 h-5" />,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-black/20 p-6 rounded-lg relative overflow-hidden group hover:bg-black/30 transition-colors"
          >
            {/* Ícone de Fundo */}
            <div className="absolute -right-4 -bottom-4 opacity-5 transform scale-150 group-hover:scale-[2] transition-transform">
              {card.icon}
            </div>
            
            {/* Indicador Colorido */}
            <div className={`absolute top-0 left-0 w-1 h-full ${card.color}`} />
            
            {/* Conteúdo */}
            <div className="relative">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                {card.icon}
                <span className="text-sm font-medium">{card.title}</span>
              </div>
              <div className="text-2xl font-bold truncate">
                {card.value}
              </div>
              {card.subValue && (
                <div className="text-sm text-gray-400 mt-1">
                  {card.subValue}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Duração Média */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-black/20 p-6 rounded-lg"
        >
          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium">Duração Média</span>
          </div>
          <div className="text-3xl font-bold">
            {formatDuration(stats.averageTrackDuration)}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            por faixa
          </div>
        </motion.div>

        {/* Taxa de Reprodução */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-black/20 p-6 rounded-lg"
        >
          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <Play className="w-5 h-5" />
            <span className="text-sm font-medium">Taxa de Reprodução</span>
          </div>
          <div className="text-3xl font-bold">
            {stats.totalTracks > 0
              ? (stats.mostPlayedTrack?.playCount || 0 / stats.totalTracks).toFixed(1)
              : '0'}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            reproduções por faixa
          </div>
        </motion.div>

        {/* Tempo Total de Reprodução */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-black/20 p-6 rounded-lg"
        >
          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <Repeat className="w-5 h-5" />
            <span className="text-sm font-medium">Tempo Total de Reprodução</span>
          </div>
          <div className="text-3xl font-bold">
            {formatDuration(stats.totalPlayTime)}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            de música
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RadioStats; 