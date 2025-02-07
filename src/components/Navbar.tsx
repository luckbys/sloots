import { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Coins, User, LogOut, Settings } from 'lucide-react';

const Navbar: FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-black/30 border-b border-purple-500/20 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Coins className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold text-yellow-500">Sloots</span>
          </Link>

          {/* Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-purple-400">
                  <User className="w-5 h-5" />
                  <span>{user.name}</span>
                </div>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg
                      bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Admin</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                  bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Entrar</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 