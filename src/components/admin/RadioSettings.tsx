import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Volume2, Shuffle, Repeat } from 'lucide-react';
import type { RadioState } from '../../types/radio';
import { radioService } from '../../services/radio.service';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RadioSettings: FC = () => {
  const [state, setState] = useState<RadioState>(radioService.getCurrentState());

  useEffect(() => {
    const interval = setInterval(() => {
      setState(radioService.getCurrentState());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVolumeChange = (value: number) => {
    radioService.setVolume(value / 100);
  };

  const handleShuffleToggle = () => {
    radioService.toggleShuffle();
  };

  const handleRepeatModeChange = (value: string) => {
    radioService.setRepeatMode(value as 'none' | 'all' | 'one');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xl font-semibold">
        <Settings className="w-6 h-6" />
        <span>Configurações do Rádio</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controles de Volume */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <Label className="text-lg">Volume Principal</Label>
            <div className="flex items-center gap-4">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <Slider
                value={[state.volume * 100]}
                onValueChange={([value]) => handleVolumeChange(value)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-gray-400 w-12 text-right">
                {Math.round(state.volume * 100)}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Controles de Reprodução */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <Label className="text-lg">Modo de Reprodução</Label>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-gray-400" />
                <span className="text-sm">Reprodução Aleatória</span>
              </div>
              <Switch
                checked={state.shuffle}
                onCheckedChange={handleShuffleToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-gray-400" />
                <span className="text-sm">Modo de Repetição</span>
              </div>
              <Select
                value={state.repeat}
                onValueChange={handleRepeatModeChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o modo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não Repetir</SelectItem>
                  <SelectItem value="all">Repetir Todas</SelectItem>
                  <SelectItem value="one">Repetir Uma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-4 border-t"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Ações Avançadas</h3>
            <p className="text-sm text-gray-400">
              Cuidado ao usar estas ações, elas podem afetar a reprodução atual
            </p>
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                radioService.stop();
                radioService.setVolume(0.5);
                radioService.setRepeatMode('none');
                radioService.toggleShuffle();
              }}
            >
              Restaurar Padrões
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Tem certeza que deseja parar a reprodução atual?')) {
                  radioService.stop();
                }
              }}
            >
              Parar Reprodução
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RadioSettings; 