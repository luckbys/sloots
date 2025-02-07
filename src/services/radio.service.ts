import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { RadioTrack, RadioState, RadioStats, RepeatMode } from '../types/radio';

class RadioService {
  private tracks: RadioTrack[] = [];
  private state: RadioState = {
    currentTrack: null,
    queue: [],
    isPlaying: false,
    volume: 0.5,
    shuffle: false,
    repeat: 'none'
  };
  private audio: HTMLAudioElement | null = null;

  constructor() {
    // Carregar músicas da pasta radio
    this.loadTracksFromDirectory();
    
    // Recuperar estado do localStorage
    const savedState = localStorage.getItem('radio_state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        this.state = {
          ...this.state,
          volume: parsedState.volume ?? 0.5,
          shuffle: parsedState.shuffle ?? false,
          repeat: parsedState.repeat ?? 'none'
        };
      } catch (error) {
        console.warn('Erro ao carregar estado do rádio:', error);
      }
    }

    // Inicializar o elemento de áudio
    this.audio = new Audio();
    this.audio.volume = this.state.volume;

    // Configurar eventos do áudio
    this.audio.addEventListener('ended', () => {
      this.playNext();
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Erro ao reproduzir áudio:', e);
      toast.error('Erro ao reproduzir música');
      this.playNext();
    });
  }

  private async loadTracksFromDirectory() {
    try {
      // Carregar lista de músicas da pasta radio
      const response = await fetch('/sounds/radio/tracks.json');
      if (!response.ok) {
        throw new Error('Arquivo de lista de músicas não encontrado');
      }

      const trackList = await response.json();
      
      // Verificar cada arquivo de música antes de adicionar à lista
      const validTracks = [];
      for (const track of trackList) {
        try {
          const audioResponse = await fetch(`/sounds/radio/${track.filename}`);
          if (!audioResponse.ok) {
            console.warn(`Arquivo de música não encontrado: ${track.filename}`);
            continue;
          }
          validTracks.push(track);
        } catch (error) {
          console.warn(`Erro ao verificar arquivo de música ${track.filename}:`, error);
          continue;
        }
      }

      if (validTracks.length === 0) {
        throw new Error('Nenhuma música válida encontrada');
      }

      this.tracks = validTracks.map((track: any) => ({
        id: uuidv4(),
        title: track.title,
        artist: track.artist,
        url: `/sounds/radio/${track.filename}`,
        duration: track.duration || 0,
        addedAt: new Date(track.addedAt || Date.now()),
        addedBy: track.addedBy || 'Sistema',
        isActive: true,
        playCount: 0,
        lastPlayed: undefined
      }));

      // Atualizar a fila se estiver vazia
      if (this.state.queue.length === 0) {
        this.state.queue = this.getActiveTracks();
        if (this.state.shuffle) {
          this.state.queue = this.shuffleArray([...this.state.queue]);
        }
      }

      toast.success(`${this.tracks.length} músicas carregadas`);
    } catch (error) {
      console.error('Erro ao carregar músicas:', error);
      toast.error('Erro ao carregar lista de músicas');
    }
  }

  private getActiveTracks(): RadioTrack[] {
    return this.tracks.filter(track => track.isActive);
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('radio_state', JSON.stringify({
        volume: this.state.volume,
        shuffle: this.state.shuffle,
        repeat: this.state.repeat
      }));
    } catch (error) {
      console.warn('Erro ao salvar estado do rádio:', error);
    }
  }

  private updateTrackStats(track: RadioTrack) {
    track.playCount++;
    track.lastPlayed = new Date();
    this.saveToLocalStorage();
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async addTrack(track: Omit<RadioTrack, 'id' | 'isActive' | 'playCount' | 'addedAt'>): Promise<void> {
    const newTrack: RadioTrack = {
      ...track,
      id: uuidv4(),
      isActive: true,
      playCount: 0,
      addedAt: new Date()
    };

    // Carregar duração do áudio
    try {
      const audio = new Audio();
      audio.src = track.url;
      await new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', () => {
          newTrack.duration = audio.duration;
          resolve(null);
        });
        audio.addEventListener('error', reject);
      });
    } catch (error) {
      console.error('Erro ao carregar duração do áudio:', error);
      newTrack.duration = 0;
    }

    this.tracks.push(newTrack);
    this.saveToLocalStorage();
  }

  removeTrack(trackId: string): void {
    const index = this.tracks.findIndex(t => t.id === trackId);
    if (index !== -1) {
      this.tracks.splice(index, 1);
      
      // Remover da fila e parar se for a faixa atual
      this.state.queue = this.state.queue.filter(t => t.id !== trackId);
      if (this.state.currentTrack?.id === trackId) {
        this.stop();
      }
      
      this.saveToLocalStorage();
    }
  }

  toggleTrackStatus(trackId: string): void {
    const track = this.tracks.find(t => t.id === trackId);
    if (track) {
      track.isActive = !track.isActive;
      
      // Se desativada, remover da fila e parar se for a faixa atual
      if (!track.isActive) {
        this.state.queue = this.state.queue.filter(t => t.id !== trackId);
        if (this.state.currentTrack?.id === trackId) {
          this.stop();
        }
      }
      
      this.saveToLocalStorage();
    }
  }

  play(trackId?: string): void {
    try {
      let track: RadioTrack | null = null;

      if (trackId) {
        track = this.tracks.find(t => t.id === trackId) || null;
      } else if (this.state.currentTrack) {
        track = this.state.currentTrack;
      } else if (this.state.queue.length > 0) {
        track = this.state.queue[0];
      }

      if (!track) {
        toast.error('Nenhuma música disponível para tocar');
        return;
      }

      if (!this.audio) {
        this.audio = new Audio();
        this.audio.volume = this.state.volume;
      }

      // Verificar se o arquivo existe antes de tocar
      fetch(track.url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Arquivo de música não encontrado');
          }
          
          this.audio!.src = track!.url;
          this.state.currentTrack = track;
          this.state.isPlaying = true;
          
          this.audio!.play()
            .then(() => {
              this.updateTrackStats(track!);
            })
            .catch(error => {
              console.error('Erro ao reproduzir música:', error);
              toast.error('Erro ao reproduzir música');
              this.playNext();
            });
        })
        .catch(error => {
          console.error('Erro ao verificar arquivo de música:', error);
          toast.error('Erro ao verificar arquivo de música');
          this.playNext();
        });
    } catch (error) {
      console.error('Erro ao iniciar reprodução:', error);
      toast.error('Erro ao iniciar reprodução');
    }
  }

  pause(): void {
    if (this.audio && this.state.isPlaying) {
      this.audio.pause();
      this.state.isPlaying = false;
      this.saveToLocalStorage();
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.state.isPlaying = false;
      this.state.currentTrack = null;
      this.saveToLocalStorage();
    }
  }

  playNext(): void {
    if (!this.state.currentTrack) {
      this.play();
      return;
    }

    let nextTrack: RadioTrack | undefined;

    if (this.state.repeat === 'one') {
      nextTrack = this.state.currentTrack;
    } else if (this.state.queue.length > 0) {
      nextTrack = this.state.queue[0];
      this.state.queue = this.state.queue.slice(1);
    } else {
      // Criar nova fila baseada no modo de repetição
      const activeTracks = this.tracks.filter(t => t.isActive);
      if (activeTracks.length > 0) {
        if (this.state.shuffle) {
          this.state.queue = this.shuffleArray(activeTracks);
        } else {
          this.state.queue = [...activeTracks];
        }

        // Remover a faixa atual da fila
        this.state.queue = this.state.queue.filter(t => t.id !== this.state.currentTrack?.id);

        if (this.state.repeat === 'all') {
          nextTrack = this.state.queue[0];
          this.state.queue = this.state.queue.slice(1);
        }
      }
    }

    if (nextTrack) {
      this.play(nextTrack.id);
    } else {
      this.stop();
    }
  }

  playPrevious(): void {
    // Implementar lógica para tocar faixa anterior
    // Por enquanto, apenas reinicia a faixa atual
    if (this.audio) {
      this.audio.currentTime = 0;
    }
  }

  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
      this.state.volume = this.audio.volume;
      this.saveToLocalStorage();
    }
  }

  toggleShuffle(): void {
    this.state.shuffle = !this.state.shuffle;
    this.saveToLocalStorage();
  }

  setRepeatMode(mode: RepeatMode): void {
    this.state.repeat = mode;
    this.saveToLocalStorage();
  }

  getTracks(): RadioTrack[] {
    return [...this.tracks];
  }

  getCurrentState(): RadioState {
    return { ...this.state };
  }

  getStats(): RadioStats {
    const activeTracks = this.tracks.filter(t => t.isActive);
    
    const totalPlayTime = activeTracks.reduce((sum, track) => sum + track.duration, 0);
    
    let mostPlayedTrack: RadioTrack | null = null;
    let maxPlayCount = 0;
    for (const track of activeTracks) {
      if (track.playCount > maxPlayCount) {
        mostPlayedTrack = track;
        maxPlayCount = track.playCount;
      }
    }

    const lastAddedTrack = activeTracks.length > 0 
      ? activeTracks.reduce((latest, track) => 
          track.addedAt > latest.addedAt ? track : latest
        )
      : null;

    return {
      totalTracks: activeTracks.length,
      totalPlayTime,
      mostPlayedTrack,
      lastAddedTrack,
      averageTrackDuration: activeTracks.length > 0 ? totalPlayTime / activeTracks.length : 0
    };
  }
}

export const radioService = new RadioService(); 