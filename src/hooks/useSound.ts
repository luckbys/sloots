import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const sounds = {
  spin: '/sounds/spin.mp3',
  win: '/sounds/win.mp3',
  jackpot: '/sounds/jackpot.mp3',
  click: '/sounds/click.mp3',
  background: '/sounds/background.mp3'
} as const;

type SoundKey = keyof typeof sounds;

export const useSound = () => {
  const audioRefs = useRef<Record<SoundKey, HTMLAudioElement | null>>({
    spin: null,
    win: null,
    jackpot: null,
    click: null,
    background: null
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoaded, setIsLoaded] = useState<Record<SoundKey, boolean>>({
    spin: false,
    win: false,
    jackpot: false,
    click: false,
    background: false
  });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    const loadAudio = async (key: SoundKey, path: string) => {
      try {
        // Verificar se o arquivo existe antes de criar o elemento de áudio
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`Arquivo de áudio ${key} não encontrado`);
        }

        const audio = new Audio(path);
        
        audio.addEventListener('canplaythrough', () => {
          setIsLoaded(prev => ({ ...prev, [key]: true }));
        });

        audio.addEventListener('error', (e) => {
          console.warn(`Erro ao carregar áudio ${key}:`, e);
          setIsLoaded(prev => ({ ...prev, [key]: false }));
          toast.error(`Erro ao carregar som ${key}`);
        });

        if (key === 'background') {
          audio.loop = true;
          audio.volume = 0.3;
          audio.addEventListener('ended', () => {
            audio.currentTime = 0;
            audio.play().catch(console.warn);
          });
        }
        
        audioRefs.current[key] = audio;
      } catch (error) {
        console.warn(`Erro ao inicializar áudio ${key}:`, error);
        setIsLoaded(prev => ({ ...prev, [key]: false }));
        toast.error(`Erro ao carregar som ${key}`);
      }
    };

    // Carregar todos os sons
    Object.entries(sounds).forEach(([key, path]) => {
      loadAudio(key as SoundKey, path);
    });

    const handleInteraction = () => {
      if (!isInitialized) {
        setIsInitialized(true);
        const bgMusic = audioRefs.current.background;
        if (bgMusic && isLoaded.background) {
          bgMusic.play()
            .then(() => setIsMusicPlaying(true))
            .catch(error => {
              console.warn('Erro ao iniciar música de fundo:', error);
              toast.error('Erro ao iniciar música de fundo');
            });
        }
        document.removeEventListener('click', handleInteraction);
      }
    };

    document.addEventListener('click', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, [isInitialized]);

  const play = async (sound: SoundKey) => {
    if (!isInitialized || !isLoaded[sound]) {
      console.warn(`Som ${sound} não está pronto para tocar`);
      return;
    }
    
    try {
      const audio = audioRefs.current[sound];
      if (audio) {
        if (sound === 'background') {
          if (!isMusicPlaying) {
            await audio.play();
            setIsMusicPlaying(true);
          }
        } else {
          audio.currentTime = 0;
          await audio.play();
        }
      }
    } catch (error) {
      console.warn(`Erro ao tocar áudio ${sound}:`, error);
      toast.error(`Erro ao tocar som ${sound}`);
    }
  };

  const toggleBackground = (playing: boolean) => {
    if (!isInitialized || !isLoaded.background) {
      console.warn('Música de fundo não está pronta');
      return;
    }

    try {
      const bgMusic = audioRefs.current.background;
      if (bgMusic) {
        if (playing && !isMusicPlaying) {
          bgMusic.play()
            .then(() => setIsMusicPlaying(true))
            .catch(error => {
              console.warn('Erro ao iniciar música de fundo:', error);
              toast.error('Erro ao iniciar música de fundo');
            });
        } else if (!playing && isMusicPlaying) {
          bgMusic.pause();
          setIsMusicPlaying(false);
        }
      }
    } catch (error) {
      console.warn('Erro ao controlar música de fundo:', error);
      toast.error('Erro ao controlar música de fundo');
    }
  };

  const setBackgroundVolume = (volume: number) => {
    const bgMusic = audioRefs.current.background;
    if (bgMusic) {
      bgMusic.volume = Math.max(0, Math.min(1, volume));
    }
  };

  return { 
    play, 
    toggleBackground,
    setBackgroundVolume,
    isInitialized,
    isLoaded,
    isMusicPlaying
  };
}; 