import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
  BarChart2,
  Lock,
  Unlock,
  Percent,
  DollarSign,
  Trophy,
  Star,
  Loader2
} from 'lucide-react';
import { gameSettingsService, GameSettings, GameDifficulty, GameStats } from '../../services/game-settings.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const GameSettingsPanel: FC = () => {
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('difficulty');
  const [editingDifficulty, setEditingDifficulty] = useState<GameDifficulty | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const currentSettings = await gameSettingsService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const currentStats = await gameSettingsService.getStats();
      setStats(currentStats);
    } catch (error) {
      toast.error('Erro ao carregar estatísticas');
    }
  };

  const handleUpdateDifficulty = async (difficultyId: string, updates: Partial<GameDifficulty>) => {
    try {
      await gameSettingsService.updateDifficulty(difficultyId, updates);
      await loadSettings();
      setEditingDifficulty(null);
    } catch (error) {
      toast.error('Erro ao atualizar dificuldade');
    }
  };

  const handleSetCurrentDifficulty = async (difficultyId: string) => {
    try {
      await gameSettingsService.setCurrentDifficulty(difficultyId);
      await loadSettings();
    } catch (error) {
      toast.error('Erro ao alterar dificuldade');
    }
  };

  const handleUpdateSettings = async (updates: Partial<GameSettings>) => {
    try {
      await gameSettingsService.updateSettings(updates);
      await loadSettings();
    } catch (error) {
      toast.error('Erro ao atualizar configurações');
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      await gameSettingsService.toggleMaintenance(!settings?.maintenanceMode);
      await loadSettings();
    } catch (error) {
      toast.error('Erro ao alterar modo de manutenção');
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="difficulty">Dificuldade</TabsTrigger>
          <TabsTrigger value="symbols">Símbolos</TabsTrigger>
          <TabsTrigger value="limits">Limites</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="difficulty" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-purple-400">Configurações de Dificuldade</h2>
            <Button
              variant={settings.maintenanceMode ? "destructive" : "outline"}
              onClick={handleToggleMaintenance}
              className="flex items-center gap-2"
            >
              {settings.maintenanceMode ? (
                <>
                  <Lock className="w-4 h-4" />
                  Modo Manutenção Ativo
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Jogo Ativo
                </>
              )}
            </Button>
          </div>

          <div className="grid gap-4">
            {settings.difficulties.map(difficulty => (
              <Card key={difficulty.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{difficulty.name}</h3>
                        {!difficulty.isActive && (
                          <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
                            Desativado
                          </span>
                        )}
                        {settings.currentDifficulty === difficulty.id && (
                          <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                            Atual
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{difficulty.description}</p>
                    </div>

                    <div className="flex gap-2">
                      {editingDifficulty?.id === difficulty.id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleUpdateDifficulty(difficulty.id, editingDifficulty);
                          }}
                        >
                          <Save className="w-4 h-4" />
                          Salvar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDifficulty(difficulty)}
                        >
                          <Settings className="w-4 h-4" />
                          Editar
                        </Button>
                      )}

                      {difficulty.isActive && settings.currentDifficulty !== difficulty.id && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSetCurrentDifficulty(difficulty.id)}
                        >
                          Ativar
                        </Button>
                      )}
                    </div>
                  </div>

                  {editingDifficulty?.id === difficulty.id ? (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Taxa de Vitória (%)</Label>
                        <Input
                          type="number"
                          value={editingDifficulty.winRate * 100}
                          onChange={(e) => setEditingDifficulty({
                            ...editingDifficulty,
                            winRate: Number(e.target.value) / 100
                          })}
                          step="1"
                          min="0"
                          max="100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Chance de Jackpot (%)</Label>
                        <Input
                          type="number"
                          value={editingDifficulty.jackpotChance * 100}
                          onChange={(e) => setEditingDifficulty({
                            ...editingDifficulty,
                            jackpotChance: Number(e.target.value) / 100
                          })}
                          step="0.001"
                          min="0"
                          max="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Aposta Mínima</Label>
                        <Input
                          type="number"
                          value={editingDifficulty.minBet}
                          onChange={(e) => setEditingDifficulty({
                            ...editingDifficulty,
                            minBet: Number(e.target.value)
                          })}
                          min="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Aposta Máxima</Label>
                        <Input
                          type="number"
                          value={editingDifficulty.maxBet}
                          onChange={(e) => setEditingDifficulty({
                            ...editingDifficulty,
                            maxBet: Number(e.target.value)
                          })}
                          min="1"
                        />
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label>Multiplicadores (separados por vírgula)</Label>
                        <Input
                          value={editingDifficulty.multipliers.join(', ')}
                          onChange={(e) => setEditingDifficulty({
                            ...editingDifficulty,
                            multipliers: e.target.value.split(',').map(Number)
                          })}
                          placeholder="1.2, 1.5, 2, 3"
                        />
                      </div>

                      <div className="col-span-2 flex items-center gap-2">
                        <Switch
                          checked={editingDifficulty.isActive}
                          onCheckedChange={(checked) => setEditingDifficulty({
                            ...editingDifficulty,
                            isActive: checked
                          })}
                        />
                        <Label>Dificuldade Ativa</Label>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      <StatItem
                        label="Taxa de Vitória"
                        value={`${(difficulty.winRate * 100).toFixed(1)}%`}
                        icon={<Percent className="w-4 h-4 text-green-400" />}
                      />
                      <StatItem
                        label="Chance de Jackpot"
                        value={`${(difficulty.jackpotChance * 100).toFixed(4)}%`}
                        icon={<Trophy className="w-4 h-4 text-yellow-400" />}
                      />
                      <StatItem
                        label="Aposta Mínima"
                        value={`R$ ${difficulty.minBet}`}
                        icon={<DollarSign className="w-4 h-4 text-blue-400" />}
                      />
                      <StatItem
                        label="Aposta Máxima"
                        value={`R$ ${difficulty.maxBet}`}
                        icon={<DollarSign className="w-4 h-4 text-purple-400" />}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="symbols" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Símbolos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pesos dos Símbolos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Pesos dos Símbolos
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(settings.symbolWeights).map(([symbol, weight]) => (
                      <div key={symbol} className="flex items-center gap-4">
                        <span className="text-2xl w-12 h-12 flex items-center justify-center 
                          bg-black/20 rounded-lg border border-purple-500/20">
                          {symbol}
                        </span>
                        <div className="flex-1">
                          <Label>Peso</Label>
                          <Input
                            type="number"
                            value={weight}
                            onChange={(e) => handleUpdateSettings({
                              symbolWeights: {
                                ...settings.symbolWeights,
                                [symbol]: Number(e.target.value)
                              }
                            })}
                            min="1"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Taxas de Pagamento */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Taxas de Pagamento
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(settings.payoutRates).map(([symbol, rate]) => (
                      <div key={symbol} className="flex items-center gap-4">
                        <span className="text-2xl w-12 h-12 flex items-center justify-center 
                          bg-black/20 rounded-lg border border-purple-500/20">
                          {symbol}
                        </span>
                        <div className="flex-1">
                          <Label>Multiplicador</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={rate}
                              onChange={(e) => handleUpdateSettings({
                                payoutRates: {
                                  ...settings.payoutRates,
                                  [symbol]: Number(e.target.value)
                                }
                              })}
                              min="1"
                              className="mt-1"
                            />
                            <span className="text-gray-400">x</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Limites e Restrições</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Limites Diários */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Limites Diários
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Perda Máxima Diária</Label>
                      <Input
                        type="number"
                        value={settings.maxDailyLoss}
                        onChange={(e) => handleUpdateSettings({
                          maxDailyLoss: Number(e.target.value)
                        })}
                        min="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Ganho Máximo Diário</Label>
                      <Input
                        type="number"
                        value={settings.maxDailyWin}
                        onChange={(e) => handleUpdateSettings({
                          maxDailyWin: Number(e.target.value)
                        })}
                        min="0"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Configurações de Jackpot */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Configurações de Jackpot
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Valor Mínimo do Jackpot</Label>
                      <Input
                        type="number"
                        value={settings.jackpotMinValue}
                        onChange={(e) => handleUpdateSettings({
                          jackpotMinValue: Number(e.target.value)
                        })}
                        min="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Valor Máximo do Jackpot</Label>
                      <Input
                        type="number"
                        value={settings.jackpotMaxValue}
                        onChange={(e) => handleUpdateSettings({
                          jackpotMaxValue: Number(e.target.value)
                        })}
                        min="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Taxa de Aumento do Jackpot (%)</Label>
                      <Input
                        type="number"
                        value={settings.jackpotIncreaseRate * 100}
                        onChange={(e) => handleUpdateSettings({
                          jackpotIncreaseRate: Number(e.target.value) / 100
                        })}
                        step="0.1"
                        min="0"
                        max="100"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Configurações Gerais */}
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configurações Gerais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Multiplicador Global</Label>
                      <Input
                        type="number"
                        value={settings.globalMultiplier}
                        onChange={(e) => handleUpdateSettings({
                          globalMultiplier: Number(e.target.value)
                        })}
                        min="0.1"
                        step="0.1"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Frequência de Bônus (%)</Label>
                      <Input
                        type="number"
                        value={settings.bonusFrequency * 100}
                        onChange={(e) => handleUpdateSettings({
                          bonusFrequency: Number(e.target.value) / 100
                        })}
                        min="0"
                        max="100"
                        step="0.1"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Multiplicador Máximo</Label>
                      <Input
                        type="number"
                        value={settings.maxMultiplier}
                        onChange={(e) => handleUpdateSettings({
                          maxMultiplier: Number(e.target.value)
                        })}
                        min="1"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Volatilidade</Label>
                    <div className="grid grid-cols-3 gap-4 mt-1">
                      {['low', 'medium', 'high'].map((volatility) => (
                        <Button
                          key={volatility}
                          variant={settings.volatility === volatility ? "default" : "outline"}
                          onClick={() => handleUpdateSettings({ volatility: volatility as GameSettings['volatility'] })}
                          className="w-full"
                        >
                          {volatility === 'low' && 'Baixa'}
                          {volatility === 'medium' && 'Média'}
                          {volatility === 'high' && 'Alta'}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas do Jogo</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total de Apostas</Label>
                <p className="text-2xl font-bold">{settings.totalBets}</p>
              </div>
              <div>
                <Label>Total Pago</Label>
                <p className="text-2xl font-bold">{settings.totalPayout}</p>
              </div>
              <div>
                <Label>Jackpots Atingidos</Label>
                <p className="text-2xl font-bold">{settings.jackpotsHit}</p>
              </div>
              <div>
                <Label>Maior Vitória</Label>
                <p className="text-2xl font-bold">{settings.biggestWin}</p>
              </div>
              <div>
                <Label>Média de Vitórias</Label>
                <p className="text-2xl font-bold">{settings.averageWin}</p>
              </div>
              {stats && (
                <>
                  <div>
                    <Label>Total de Rodadas</Label>
                    <p className="text-2xl font-bold">{stats.totalSpins}</p>
                  </div>
                  <div>
                    <Label>RTP Atual</Label>
                    <p className="text-2xl font-bold">{stats.rtp}%</p>
                  </div>
                  <div>
                    <Label>Sequência Atual de Vitórias</Label>
                    <p className="text-2xl font-bold">{stats.currentWinStreak}</p>
                  </div>
                  <div>
                    <Label>Maior Sequência de Vitórias</Label>
                    <p className="text-2xl font-bold">{stats.maxWinStreak}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

// Componentes auxiliares
const TabButton: FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
      active
        ? 'bg-purple-500 text-white'
        : 'bg-black/20 text-gray-300 hover:bg-purple-500/20'
    }`}
  >
    {icon}
    <span>{label}</span>
  </motion.button>
);

const StatCard: FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-400 text-sm">{title}</span>
      {icon}
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

// Componente auxiliar para exibir estatísticas
const StatItem: FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="text-center p-2 bg-black/20 rounded-lg">
    <div className="flex items-center justify-center gap-2 mb-1">
      {icon}
      <span className="text-sm text-gray-400">{label}</span>
    </div>
    <div className="font-bold">{value}</div>
  </div>
);

export default GameSettingsPanel; 