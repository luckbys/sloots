import { FC, useEffect, useState } from 'react';

interface ConfettiProps {
  active: boolean;
}

const Confetti: FC<ConfettiProps> = ({ active }) => {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; color: string }>>([]);

  useEffect(() => {
    if (active) {
      const colors = ['#FFD700', '#FF6B6B', '#4CAF50', '#2196F3', '#9C27B0'];
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${particle.left}%`,
            top: '-10px',
            backgroundColor: particle.color,
            animation: 'confetti 1s ease-out forwards',
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
};

export default Confetti; 