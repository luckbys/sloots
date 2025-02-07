import { toast } from 'sonner';

export interface Tournament {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  minLevel: number;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'active' | 'finished';
  leaderboard: TournamentPlayer[];
}

export interface TournamentPlayer {
  userId: string;
  username: string;
  points: number;
  position: number;
  totalSpins: number;
  biggestWin: number;
}

class TournamentService {
  private tournaments: Tournament[] = [];

  constructor() {
    // Simulação de torneios
    this.tournaments = [
      {
        id: 'weekly-1',
        title: 'Torneio Semanal',
        description: 'Compete pelos maiores prêmios da semana!',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        minLevel: 5,
        entryFee: 100,
        prizePool: 10000,
        maxParticipants: 100,
        currentParticipants: 45,
        status: 'active',
        leaderboard: []
      }
    ];
  }

  async getActiveTournaments(): Promise<Tournament[]> {
    return this.tournaments.filter(t => t.status === 'active');
  }

  async joinTournament(tournamentId: string, userId: string): Promise<boolean> {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) {
      toast.error('Torneio não encontrado');
      return false;
    }

    if (tournament.currentParticipants >= tournament.maxParticipants) {
      toast.error('Torneio está cheio');
      return false;
    }

    tournament.currentParticipants++;
    toast.success('Você entrou no torneio!');
    return true;
  }

  async updatePoints(tournamentId: string, userId: string, points: number): Promise<void> {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) return;

    const playerIndex = tournament.leaderboard.findIndex(p => p.userId === userId);
    
    if (playerIndex === -1) {
      tournament.leaderboard.push({
        userId,
        username: `Player ${userId}`,
        points,
        position: tournament.leaderboard.length + 1,
        totalSpins: 1,
        biggestWin: points
      });
    } else {
      tournament.leaderboard[playerIndex].points += points;
      tournament.leaderboard[playerIndex].totalSpins++;
      tournament.leaderboard[playerIndex].biggestWin = Math.max(
        tournament.leaderboard[playerIndex].biggestWin,
        points
      );
    }

    // Atualiza as posições
    tournament.leaderboard.sort((a, b) => b.points - a.points);
    tournament.leaderboard.forEach((player, index) => {
      player.position = index + 1;
    });
  }

  async getLeaderboard(tournamentId: string): Promise<TournamentPlayer[]> {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    return tournament?.leaderboard || [];
  }

  async claimReward(tournamentId: string, userId: string): Promise<number> {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    
    if (!tournament || tournament.status !== 'finished') {
      toast.error('Torneio ainda não foi finalizado');
      return 0;
    }

    const player = tournament.leaderboard.find(p => p.userId === userId);
    
    if (!player) {
      toast.error('Jogador não participou do torneio');
      return 0;
    }

    // Cálculo do prêmio baseado na posição
    let reward = 0;
    if (player.position === 1) reward = tournament.prizePool * 0.5;
    else if (player.position === 2) reward = tournament.prizePool * 0.3;
    else if (player.position === 3) reward = tournament.prizePool * 0.15;
    else if (player.position <= 10) reward = tournament.prizePool * 0.05 / 7;

    toast.success(`Você recebeu R$ ${reward.toFixed(2)} de prêmio!`);
    return reward;
  }
}

export const tournamentService = new TournamentService(); 