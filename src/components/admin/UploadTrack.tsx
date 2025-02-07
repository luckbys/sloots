import { FC, useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { radioService } from '../../services/radio.service';

interface UploadTrackProps {
  onUploadComplete?: () => void;
}

const UploadTrack: FC<UploadTrackProps> = ({ onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [metadata, setMetadata] = useState({
    title: '',
    artist: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'audio/mpeg') {
      setFile(droppedFile);
      // Tentar extrair metadados do nome do arquivo
      const fileName = droppedFile.name.replace('.mp3', '');
      const parts = fileName.split('-').map(p => p.trim());
      if (parts.length >= 2) {
        setMetadata({
          artist: parts[0],
          title: parts[1]
        });
      }
    } else {
      toast.error('Por favor, selecione apenas arquivos MP3');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'audio/mpeg') {
      setFile(selectedFile);
      // Tentar extrair metadados do nome do arquivo
      const fileName = selectedFile.name.replace('.mp3', '');
      const parts = fileName.split('-').map(p => p.trim());
      if (parts.length >= 2) {
        setMetadata({
          artist: parts[0],
          title: parts[1]
        });
      }
    } else {
      toast.error('Por favor, selecione apenas arquivos MP3');
    }
  };

  const handleUpload = async () => {
    if (!file || !metadata.title || !metadata.artist) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsUploading(true);
    try {
      // Criar URL do arquivo
      const fileUrl = URL.createObjectURL(file);

      // Adicionar faixa
      await radioService.addTrack({
        title: metadata.title,
        artist: metadata.artist,
        url: fileUrl,
        duration: 0 // Será calculado pelo serviço
      });

      toast.success('Faixa adicionada com sucesso!');
      setFile(null);
      setMetadata({ title: '', artist: '' });
      onUploadComplete?.();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da faixa');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de Drop */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-300 hover:border-purple-500'}
          ${file ? 'border-green-500 bg-green-500/10' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="audio/mpeg"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="font-medium">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setMetadata({ title: '', artist: '' });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-2"
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <p className="text-gray-500">
                Arraste um arquivo MP3 ou clique para selecionar
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Formulário de Metadados */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Título da Música</Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nome da música"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="artist">Artista</Label>
              <Input
                id="artist"
                value={metadata.artist}
                onChange={(e) => setMetadata(prev => ({ ...prev, artist: e.target.value }))}
                placeholder="Nome do artista"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={isUploading || !metadata.title || !metadata.artist}
            >
              {isUploading ? 'Enviando...' : 'Enviar Música'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadTrack; 