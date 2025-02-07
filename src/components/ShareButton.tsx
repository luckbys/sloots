import { FC } from 'react';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
}

const ShareButton: FC<ShareButtonProps> = ({ title, text, url = window.location.href }) => {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url
        });
      } else {
        // Fallback para copiar para a área de transferência
        await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
        toast.success('Texto copiado para a área de transferência!', {
          description: 'Cole em qualquer lugar para compartilhar'
        });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error('Não foi possível compartilhar', {
        description: 'Tente novamente mais tarde'
      });
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500 
        rounded-lg text-white font-bold shadow-[0_0_10px_rgba(59,130,246,0.3)] 
        hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all transform 
        hover:scale-105 border-2 border-blue-400"
    >
      <Share2 className="w-4 h-4" />
      <span>Compartilhar</span>
    </button>
  );
};

export default ShareButton; 