import { FC, memo } from 'react';
import { Trophy, Clock } from 'lucide-react';

export interface WinRecord {
  id: string;
  amount: number;
  symbols: string[];
  timestamp: Date;
  isJackpot: boolean;
}

interface WinHistoryProps {
  history: WinRecord[];
}

const WinRecordItem = memo(({ record }: { record: WinRecord }) => (
  <div
    className={`flex items-center justify-between p-2 rounded ${
      record.isJackpot ? 'bg-purple-900/30' : 'bg-black/20'
    }`}
  >
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {record.symbols.map((symbol, idx) => (
          <span key={idx}>{symbol}</span>
        ))}
      </div>
      <span className={`${record.isJackpot ? 'text-yellow-400' : 'text-green-400'}`}>
        +{record.amount}
      </span>
    </div>
    <div className="flex items-center gap-1 text-xs text-gray-400">
      <Clock className="w-3 h-3" />
      {new Date(record.timestamp).toLocaleTimeString()}
    </div>
  </div>
));

WinRecordItem.displayName = 'WinRecordItem';

const WinHistory: FC<WinHistoryProps> = memo(({ history }) => {
  return (
    <div className="bg-black/30 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-purple-300 text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Histórico de Ganhos
        </h3>
      </div>
      
      <div className="h-40 overflow-y-auto custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-gray-400 text-sm text-center">
            Nenhum ganho registrado ainda
          </div>
        ) : (
          <div className="space-y-2">
            {history.map(record => (
              <WinRecordItem key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

WinHistory.displayName = 'WinHistory';

export default WinHistory; 