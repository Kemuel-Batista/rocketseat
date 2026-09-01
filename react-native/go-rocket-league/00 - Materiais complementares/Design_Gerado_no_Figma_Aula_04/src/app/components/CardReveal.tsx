import { motion } from 'motion/react';
import { X, Star, Zap, Trophy } from 'lucide-react';

interface CardRevealProps {
  card: {
    id: string;
    team: string;
    player: string;
    rating: number;
    rarity: string;
  };
  onClose: () => void;
}

export function CardReveal({ card, onClose }: CardRevealProps) {
  const rarityColors = {
    'Legendary': 'from-amber-500 to-yellow-500',
    'Rare': 'from-purple-500 to-pink-500',
    'Common': 'from-blue-500 to-cyan-500'
  };

  const rarityGlow = {
    'Legendary': 'shadow-amber-500/50',
    'Rare': 'shadow-purple-500/50',
    'Common': 'shadow-blue-500/50'
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      {/* Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-cyan-400"
          initial={{
            x: '50vw',
            y: '50vh',
            opacity: 1,
            scale: 0
          }}
          animate={{
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            opacity: 0,
            scale: 1
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.05,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Card Container */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
      >
        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-20 w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-5 h-5 text-white" />
        </motion.button>

        {/* Card */}
        <motion.div 
          className={`relative w-72 h-96 rounded-3xl bg-gradient-to-br ${rarityColors[card.rarity as keyof typeof rarityColors]} p-1 shadow-2xl ${rarityGlow[card.rarity as keyof typeof rarityGlow]}`}
          animate={{
            boxShadow: [
              '0 20px 60px rgba(0, 0, 0, 0.5)',
              '0 20px 80px rgba(139, 92, 246, 0.6)',
              '0 20px 60px rgba(0, 0, 0, 0.5)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        >
          <div className="relative h-full bg-slate-900 rounded-3xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
              }} />
            </div>

            {/* Player Image */}
            <div className="relative h-2/3 overflow-hidden">
              <motion.img 
                src="https://images.unsplash.com/photo-1761225091881-0d3bda9f6d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBwbGF5ZXIlMjBhY3Rpb24lMjBzcG9ydHN8ZW58MXx8fHwxNzcwMjQ4NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt={card.player}
                className="w-full h-full object-cover"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              
              {/* Rarity Badge */}
              <motion.div 
                className={`absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r ${rarityColors[card.rarity as keyof typeof rarityColors]} flex items-center gap-1`}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Star className="w-3 h-3 text-white fill-white" />
                <span className="text-xs font-bold text-white">{card.rarity}</span>
              </motion.div>

              {/* Rating Circle */}
              <motion.div 
                className="absolute top-4 left-4 w-12 h-12 rounded-full bg-slate-900/90 backdrop-blur-sm border-2 border-cyan-400 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <span className="text-lg font-bold text-white">{card.rating}</span>
              </motion.div>
            </div>

            {/* Card Info */}
            <div className="relative p-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-2xl font-bold text-white mb-1">{card.player}</h3>
                <p className="text-cyan-400 text-sm font-semibold mb-3">{card.team}</p>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-slate-400">SPEED</span>
                    <span className="text-xs font-bold text-white">90</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-slate-400">SKILL</span>
                    <span className="text-xs font-bold text-white">88</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 1.5,
                delay: 0.5,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          className="mt-6 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">Card Discovered!</h2>
          <p className="text-slate-400">Added to your collection</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
