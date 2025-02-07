import { FC, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RadioManagement from '@/components/admin/RadioManagement';
import RadioStats from '@/components/admin/RadioStats';
import RadioSettings from '@/components/admin/RadioSettings';
import UploadTrack from '@/components/admin/UploadTrack';

const RadioAdmin: FC = () => {
  const [activeTab, setActiveTab] = useState('management');

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Gerenciamento do Rádio</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="management">
            Gerenciamento
          </TabsTrigger>
          <TabsTrigger value="upload">
            Upload
          </TabsTrigger>
          <TabsTrigger value="stats">
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="settings">
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="mt-6">
          <RadioManagement />
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <UploadTrack onUploadComplete={() => setActiveTab('management')} />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <RadioStats />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <RadioSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RadioAdmin; 