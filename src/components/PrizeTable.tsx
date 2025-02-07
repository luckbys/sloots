import { FC } from 'react';
import { Trophy } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PrizeTableProps {
  bet: number;
  symbols: Record<string, { multiplier: number; weight: number }>;
}

const PrizeTable: FC<PrizeTableProps> = ({ bet, symbols }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Trophy className="w-4 h-4 mr-2" />
          Tabela de Prêmios
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tabela de Prêmios</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-gray-400">
            Valores baseados na aposta atual de {formatCurrency(bet)}
          </div>
          <div className="grid gap-2">
            {Object.entries(symbols)
              .sort(([, a], [, b]) => b.multiplier - a.multiplier)
              .map(([symbol, { multiplier }]) => (
                <div
                  key={symbol}
                  className="flex items-center justify-between p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{symbol}</div>
                    <div className="text-sm">
                      <div className="font-bold">3x {symbol}</div>
                      <div className="text-gray-400">{multiplier}x multiplicador</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">
                      {formatCurrency(bet * multiplier)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="text-sm text-gray-400">
            * O símbolo 🃏 (Curinga) substitui qualquer outro símbolo
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrizeTable; 