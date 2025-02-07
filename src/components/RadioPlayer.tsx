import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music, Play, Pause } from 'lucide-react';
import { RadioTrack, RadioState } from '../types/radio';
import { radioService } from '../services/radio.service';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const RadioPlayer: FC = () => {
  const [state, setState] = useState<RadioState>(radioService.getCurrentState());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(state.volume);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(radioService.getCurrentState());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVolumeToggle = () => {
    if (isMuted) {
      radioService.setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(state.volume);
      radioService.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (value: number) => {
    radioService.setVolume(value / 100);
    if (value > 0) {
      setIsMuted(false);
    }
  };

  const handlePlayPause = () => {
    if (state.isPlaying) {
      radioService.pause();
    } else {
      radioService.play();
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3 bg-black/40 rounded-lg p-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white/80 hover:text-white"
          onClick={handlePlayPause}
        >
          {state.isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          {state.currentTrack ? (
            <div className="text-center">
              <div className="font-medium truncate text-purple-300">
                {state.currentTrack.title}
              </div>
              <div className="text-sm text-white/60 truncate">
                {state.currentTrack.artist}
              </div>
            </div>
          ) : (
            <div className="text-center text-white/60">
              Nenhuma faixa tocando
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white"
            onClick={handleVolumeToggle}
          >
            {isMuted || state.volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          <div className="w-24">
            <Slider
              value={[state.volume * 100]}
              onValueChange={([value]) => handleVolumeChange(value)}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadioPlayer; 