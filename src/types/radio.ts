export interface RadioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  addedAt: Date;
  addedBy: string;
  isActive: boolean;
  playCount: number;
  lastPlayed?: Date;
}

export type RepeatMode = 'none' | 'all' | 'one';

export interface RadioState {
  currentTrack: RadioTrack | null;
  queue: RadioTrack[];
  isPlaying: boolean;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
}

export interface RadioStats {
  totalTracks: number;
  totalPlayTime: number;
  mostPlayedTrack: RadioTrack | null;
  lastAddedTrack: RadioTrack | null;
  averageTrackDuration: number;
} 