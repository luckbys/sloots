import { FC } from 'react';
import { HelpCircle, Star, Trophy, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const GameRules: FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <HelpCircle className="w-4 h-4 mr-2" />
          Como Jogar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Como Jogar</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Regras Básicas */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Regras Básicas
            </h3>
            <div className="grid gap-4">
              <Card className="p-4 bg-black/20">
                <p className="text-sm">
                  1. Escolha o valor da sua aposta usando os controles disponíveis.
                </p>
              </Card>
              <Card className="p-4 bg-black/20">
                <p className="text-sm">
                  2. Clique no botão "Girar" para iniciar uma rodada.
                </p>
              </Card>
              <Card className="p-4 bg-black/20">
                <p className="text-sm">
                  3. Combine três símbolos iguais para ganhar prêmios.
                </p>
              </Card>
            </div>
          </section>

          {/* Símbolos Especiais */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              Símbolos Especiais
            </h3>
            <div className="grid gap-4">
              <Card className="p-4 bg-black/20">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">7️⃣</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Jackpot</p>
                    <p className="text-xs text-gray-400">
                      Três símbolos 7️⃣ concedem o Jackpot progressivo!
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-black/20">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">🃏</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Curinga</p>
                    <p className="text-xs text-gray-400">
                      Substitui qualquer outro símbolo para formar combinações vencedoras.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Recursos */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Recursos
            </h3>
            <div className="grid gap-4">
              <Card className="p-4 bg-black/20">
                <p className="text-sm">
                  <span className="font-bold">Autoplay:</span> Configure jogadas automáticas com condições de parada personalizadas.
                </p>
              </Card>
              <Card className="p-4 bg-black/20">
                <p className="text-sm">
                  <span className="font-bold">Histórico:</span> Acompanhe suas últimas vitórias e estatísticas de jogo.
                </p>
              </Card>
              <Card className="p-4 bg-black/20">
                <p className="text-sm">
                  <span className="font-bold">Nível:</span> Ganhe XP e suba de nível para desbloquear recursos especiais.
                </p>
              </Card>
            </div>
          </section>

          {/* Dicas */}
          <div className="text-sm text-gray-400">
            <p>* Jogue com responsabilidade e estabeleça limites para suas apostas.</p>
            <p>* Mantenha-se atualizado sobre promoções e eventos especiais.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameRules; 