import { useEffect, useRef, useState } from 'react';

const sounds = {
  spin: '/sounds/spin.mp3',
  win: '/sounds/win.mp3',
  jackpot: '/sounds/jackpot.mp3',
  click: '/sounds/click.mp3',
  background: '/sounds/background-music.mp3'
} as const;

export const useSound = () => {
  const audioRefs = useRef<Record<keyof typeof sounds, HTMLAudioElement>>({} as any);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    Object.entries(sounds).forEach(([key, path]) => {
      const audio = new Audio(path);
      if (key === 'background') {
        audio.loop = true;
        audio.volume = 0.3;
      }
      audioRefs.current[key as keyof typeof sounds] = audio;
    });

    const handleInteraction = () => {
      if (!isInitialized) {
        setIsInitialized(true);
        document.removeEventListener('click', handleInteraction);
      }
    };

    document.addEventListener('click', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  const play = async (sound: keyof typeof sounds) => {
    if (!isInitialized) return;
    
    try {
      const audio = audioRefs.current[sound];
      if (audio) {
        audio.currentTime = 0;
        await audio.play();
      }
    } catch (error) {
      console.warn('Erro ao tocar áudio:', error);
    }
  };

  const toggleBackground = (playing: boolean) => {
    if (!isInitialized) return;

    const bgMusic = audioRefs.current.background;
    if (playing) {
      bgMusic?.play().catch(console.error);
    } else {
      bgMusic?.pause();
    }
  };

  return { play, toggleBackground, isInitialized };
}; 