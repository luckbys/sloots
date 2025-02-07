interface ShareConfig {
  win: number;
  isJackpot: boolean;
  level: number;
  streak: number;
  maxWin: number;
  symbols: string[];
}

export const generateShareMessage = ({
  win,
  isJackpot,
  level,
  streak,
  maxWin,
  symbols
}: ShareConfig): { title: string; text: string } => {
  const formatMoney = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(win);

  const streakEmoji = streak > 5 ? '🔥' : streak > 3 ? '✨' : '🎲';
  const symbolsStr = symbols.join(' ');

  const messages = {
    jackpot: {
      title: '🎰 MEGA JACKPOT NO SLOOTS! 🎉',
      text: [
        `${symbolsStr} JACKPOT INCRÍVEL! ${symbolsStr}`,
        `💰 Acabei de ganhar ${formatMoney} no Sloots!`,
        `👑 Nível ${level} | ${streakEmoji} ${streak} vitórias seguidas`,
        '🎮 Venha tentar a sua sorte também!'
      ]
    },
    bigWin: {
      title: '🎰 Grande Vitória no Sloots! 💰',
      text: [
        `${symbolsStr} GRANDE VITÓRIA! ${symbolsStr}`,
        `💰 Ganhei ${formatMoney} no Sloots!`,
        `🌟 Nível ${level} | ${streakEmoji} ${streak} vitórias seguidas`,
        maxWin === win ? '🏆 Novo recorde pessoal!' : '',
        '🎮 Tente sua sorte você também!'
      ]
    },
    normal: {
      title: '🎰 Nova Vitória no Sloots! ✨',
      text: [
        `${symbolsStr} VITÓRIA! ${symbolsStr}`,
        `💰 Ganhei ${formatMoney} jogando Sloots!`,
        `⭐ Nível ${level} | ${streakEmoji} ${streak} vitórias seguidas`,
        '🎮 Venha jogar também!'
      ]
    }
  };

  const messageType = isJackpot ? 'jackpot' : win >= 100 ? 'bigWin' : 'normal';
  const message = messages[messageType];

  return {
    title: message.title,
    text: message.text.filter(Boolean).join('\n')
  };
}; 