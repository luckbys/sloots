import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Volume2,
  Upload,
  Trash2,
  Plus,
  Settings
} from 'lucide-react';
import { RadioTrack, RadioState, RadioStats } from '../../types/radio';
import { radioService } from '../../services/radio.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

const RadioManagement: FC = () => {
  const [tracks, setTracks] = useState<RadioTrack[]>([]);
  const [state, setState] = useState<RadioState>(radioService.getCurrentState());
  const [stats, setStats] = useState<RadioStats | null>(null);
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [newTrack, setNewTrack] = useState({
    title: '',
    artist: '',
    url: ''
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setTracks(radioService.getTracks());
    setState(radioService.getCurrentState());
    setStats(radioService.getStats());
  };

  const handleAddTrack = async () => {
    try {
      if (!newTrack.title || !newTrack.artist || !newTrack.url) {
        toast.error('Preencha todos os campos');
        return;
      }

      await radioService.addTrack({
        title: newTrack.title,
        artist: newTrack.artist,
        url: newTrack.url,
        duration: 0, // Será calculado ao carregar o áudio
        addedBy: 'admin'
      });

      setNewTrack({ title: '', artist: '', url: '' });
      setIsAddingTrack(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao adicionar faixa');
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    try {
      await radioService.removeTrack(trackId);
      loadData();
    } catch (error) {
      toast.error('Erro ao remover faixa');
    }
  };

  const handleToggleTrack = async (trackId: string) => {
    try {
      await radioService.toggleTrackStatus(trackId);
      loadData();
    } catch (error) {
      toast.error('Erro ao alterar status da faixa');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Music className="w-6 h-6" />
          Gerenciamento da Rádio
        </h2>
        <Button onClick={() => setIsAddingTrack(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Faixa
        </Button>
      </div>

      {/* Player */}
      <div className="bg-black/20 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            {state.currentTrack ? (
              <div>
                <div className="font-bold">{state.currentTrack.title}</div>
                <div className="text-sm text-gray-400">{state.currentTrack.artist}</div>
              </div>
            ) : (
              <div className="text-gray-400">Nenhuma faixa tocando</div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => radioService.toggleShuffle()}
              className={state.shuffle ? 'text-purple-400' : ''}
            >
              <Shuffle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => radioService.playPrevious()}
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => state.isPlaying ? radioService.pause() : radioService.play()}
              className="w-12 h-12"
            >
              {state.isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => radioService.playNext()}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const nextMode = state.repeat === 'none' ? 'all' : state.repeat === 'all' ? 'one' : 'none';
                radioService.setRepeatMode(nextMode);
              }}
              className={state.repeat !== 'none' ? 'text-purple-400' : ''}
            >
              <Repeat className="w-5 h-5" />
              {state.repeat === 'one' && <span className="absolute text-xs">1</span>}
            </Button>
          </div>
          <div className="flex items-center gap-2 w-32">
            <Volume2 className="w-4 h-4" />
            <Slider
              value={[state.volume * 100]}
              onValueChange={([value]) => radioService.setVolume(value / 100)}
              max={100}
              step={1}
            />
          </div>
        </div>
      </div>

      {/* Lista de Faixas */}
      <div className="space-y-2">
        {tracks.map(track => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              track.isActive ? 'bg-black/20' : 'bg-black/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => radioService.play(track.id)}
                  disabled={!track.isActive}
                >
                  <Play className="w-4 h-4" />
                </Button>
                <div>
                  <div className="font-bold">{track.title}</div>
                  <div className="text-sm text-gray-400">{track.artist}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400">
                  Reproduções: {track.playCount}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleTrack(track.id)}
                >
                  {track.isActive ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTrack(track.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de Adicionar Faixa */}
      <Dialog open={isAddingTrack} onOpenChange={setIsAddingTrack}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Faixa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={newTrack.title}
                onChange={e => setNewTrack(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nome da música"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Artista</label>
              <Input
                value={newTrack.artist}
                onChange={e => setNewTrack(prev => ({ ...prev, artist: e.target.value }))}
                placeholder="Nome do artista"
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL do MP3</label>
              <Input
                value={newTrack.url}
                onChange={e => setNewTrack(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://exemplo.com/musica.mp3"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingTrack(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTrack}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Total de Faixas"
            value={stats.totalTracks.toString()}
            icon={<Music className="w-5 h-5" />}
          />
          <StatCard
            title="Tempo Total"
            value={formatDuration(stats.totalPlayTime)}
            icon={<Clock className="w-5 h-5" />}
          />
          <StatCard
            title="Faixa Mais Tocada"
            value={stats.mostPlayedTrack?.title || 'N/A'}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            title="Última Adição"
            value={stats.lastAddedTrack?.title || 'N/A'}
            icon={<Plus className="w-5 h-5" />}
          />
        </div>
      )}
    </div>
  );
};

const StatCard: FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <div className="bg-black/20 p-4 rounded-lg">
    <div className="flex items-center gap-2 text-gray-400 mb-2">
      {icon}
      <span className="text-sm">{title}</span>
    </div>
    <div className="text-lg font-bold truncate">{value}</div>
  </div>
);

export default RadioManagement; 