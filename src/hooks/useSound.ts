import { useEffect, useRef } from 'react';

const sounds = {
  spin: '/sounds/spin.mp3',
  win: '/sounds/win.mp3',
  jackpot: '/sounds/jackpot.mp3',
  click: '/sounds/click.mp3',
  background: '/sounds/background-music.mp3'
} as const;

export const useSound = () => {
  const audioRefs = useRef<Record<keyof typeof sounds, HTMLAudioElement>>({} as any);

  useEffect(() => {
    Object.entries(sounds).forEach(([key, path]) => {
      const audio = new Audio(path);
      if (key === 'background') {
        audio.loop = true;
        audio.volume = 0.3;
      }
      audioRefs.current[key as keyof typeof sounds] = audio;
    });

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  const play = (sound: keyof typeof sounds) => {
    const audio = audioRefs.current[sound];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(console.error);
    }
  };

  const toggleBackground = (playing: boolean) => {
    const bgMusic = audioRefs.current.background;
    if (playing) {
      bgMusic?.play().catch(console.error);
    } else {
      bgMusic?.pause();
    }
  };

  return { play, toggleBackground };
}; 