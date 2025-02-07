import { FC, memo } from 'react';
import ShareButton from '@/components/ShareButton';
import { formatCurrency } from '../utils/format';

interface WinRecord {
  id: string;
  amount: number;
  symbols: string[];
  timestamp: Date;
  isJackpot: boolean;
}

interface WinRecordItemProps {
  record: WinRecord;
}

const WinRecordItem: FC<WinRecordItemProps> = memo(({ record }) => (
  <div className={`flex items-center justify-between p-3 rounded-lg ${
    record.isJackpot ? 'bg-purple-900/30' : 'bg-black/20'
  }`}>
    <div className="flex items-center gap-2">
      <div className="flex">
        {record.symbols.map((symbol, idx) => (
          <span key={idx} className="text-2xl">{symbol}</span>
        ))}
      </div>
      <span className={`${record.isJackpot ? 'text-yellow-400' : 'text-green-400'} font-bold`}>
        +{formatCurrency(record.amount)}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <ShareButton
        title="Vitória no Sloots! 🎰"
        text={`Ganhei ${formatCurrency(record.amount)} no Sloots! 🎰`}
      />
      <span className="text-xs text-gray-400">
        {new Date(record.timestamp).toLocaleTimeString()}
      </span>
    </div>
  </div>
));

WinRecordItem.displayName = 'WinRecordItem';

export default WinRecordItem;
export type { WinRecord }; 