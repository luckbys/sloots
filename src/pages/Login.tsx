import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Coins, Lock, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Login: FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    try {
      await login('admin@sloots.com', 'admin123');
      navigate('/admin');
      toast.success('Login administrativo realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer login administrativo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register(name, email, password);
        navigate('/');
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      toast.error('Erro ao autenticar', {
        description: 'Verifique suas credenciais e tente novamente.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/50 to-indigo-900/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coins className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl font-bold text-yellow-500">Sloots</h1>
          </div>
          <p className="text-gray-300">O melhor caça-níquel da web!</p>
        </div>

        {/* Botões de Modo */}
        <div className="flex gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAdminMode(false)}
            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2
              ${!isAdminMode 
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg' 
                : 'bg-black/20 text-gray-400'}`}
          >
            <User className="w-5 h-5" />
            Área do Jogador
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setIsAdminMode(true);
              setIsRegister(false);
            }}
            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2
              ${isAdminMode 
                ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-lg' 
                : 'bg-black/20 text-gray-400'}`}
          >
            <Shield className="w-5 h-5" />
            Área Admin
          </motion.button>
        </div>

        {/* Formulário */}
        <div className="bg-black/30 p-8 rounded-xl backdrop-blur-sm border-2 border-purple-500/20">
          <h2 className="text-2xl font-bold text-center text-purple-400 mb-6">
            {isAdminMode 
              ? 'Acesso Administrativo' 
              : isRegister 
                ? 'Criar Conta' 
                : 'Entrar'}
          </h2>

          {isAdminMode ? (
            <div className="space-y-6">
              <div className="text-center text-gray-300 text-sm mb-4">
                <p>Use as credenciais administrativas para acessar:</p>
                <p className="text-yellow-400 mt-2">
                  Email: admin@sloots.com<br />
                  Senha: admin123
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdminLogin}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 
                  rounded-lg text-black font-bold flex items-center justify-center gap-2
                  shadow-lg hover:shadow-xl transition-all disabled:opacity-50 
                  disabled:cursor-not-allowed"
              >
                <Shield className="w-6 h-6" />
                {isLoading ? 'Entrando...' : 'Acessar como Admin'}
              </motion.button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-black/20 border border-purple-500/30
                        text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-black/20 border border-purple-500/30
                      text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-black/20 border border-purple-500/30
                      text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg
                    text-white font-bold shadow-lg hover:shadow-xl transition-all transform
                    hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5 animate-pulse" />
                      Carregando...
                    </span>
                  ) : (
                    isRegister ? 'Criar Conta' : 'Entrar'
                  )}
                </motion.button>
              </form>

              {!isAdminMode && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {isRegister
                      ? 'Já tem uma conta? Entre aqui'
                      : 'Não tem uma conta? Registre-se'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login; 