import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AutoplayControlsProps {
  isActive: boolean;
  remainingSpins: number;
  totalSpins: number;
  onStart: (spins: number) => void;
  onStop: () => void;
  disabled?: boolean;
}

const AutoplayControls: FC<AutoplayControlsProps> = ({
  isActive,
  remainingSpins,
  totalSpins,
  onStart,
  onStop,
  disabled = false
}) => {
  const [spins, setSpins] = useState(50);
  const progress = ((totalSpins - remainingSpins) / totalSpins) * 100;

  return (
    <div className="w-full max-w-xs space-y-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full"
            disabled={disabled || isActive}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar Autoplay
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações de Autoplay</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Número de Rodadas</Label>
              <Input
                type="number"
                value={spins}
                onChange={(e) => setSpins(Number(e.target.value))}
                min={1}
                max={100}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map(value => (
                <Button
                  key={value}
                  variant="outline"
                  size="sm"
                  onClick={() => setSpins(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
            <Button
              className="w-full"
              onClick={() => onStart(spins)}
              disabled={spins < 1}
            >
              Iniciar Autoplay
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Rodadas Restantes</span>
            <span>{remainingSpins}/{totalSpins}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <Button
            variant="destructive"
            className="w-full"
            onClick={onStop}
          >
            <Pause className="w-4 h-4 mr-2" />
            Parar Autoplay
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default AutoplayControls; 