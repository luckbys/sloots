import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
}

interface SpinParticlesProps {
  isSpinning: boolean;
}

const COLORS = ['#9333ea', '#6366f1', '#ffd700', '#ff69b4'];
const PARTICLE_COUNT = 20;

const SpinParticles = ({ isSpinning }: SpinParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isSpinning) {
      const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 360 - 180,
        y: Math.random() * 360 - 180,
        size: Math.random() * 8 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isSpinning]);

  if (!isSpinning) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            rotate: 0,
            opacity: 1
          }}
          animate={{
            x: particle.x,
            y: particle.y,
            scale: 1,
            rotate: particle.rotation,
            opacity: 0
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
            repeat: Infinity,
            repeatType: "loop"
          }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '50%',
            filter: 'blur(1px)'
          }}
        />
      ))}
    </div>
  );
};

export default SpinParticles; 