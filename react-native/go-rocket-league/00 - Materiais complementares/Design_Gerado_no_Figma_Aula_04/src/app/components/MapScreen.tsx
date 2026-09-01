import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Zap, TrendingUp, Radar, MapPin, Sparkles } from 'lucide-react';
import { CardReveal } from './CardReveal';

interface DiscoveryPoint {
  id: string;
  x: number;
  y: number;
  team: string;
  discovered: boolean;
}

export function MapScreen() {
  const [fuel, setFuel] = useState(78);
  const [xp, setXp] = useState(2450);
  const [level, setLevel] = useState(12);
  const [isScanning, setIsScanning] = useState(false);
  const [showCardReveal, setShowCardReveal] = useState(false);
  const [revealedCard, setRevealedCard] = useState<any>(null);

  const [discoveryPoints] = useState<DiscoveryPoint[]>([
    { id: '1', x: 15, y: 35, team: 'Brazil', discovered: false },
    { id: '2', x: 45, y: 25, team: 'France', discovered: false },
    { id: '3', x: 65, y: 45, team: 'Japan', discovered: false },
    { id: '4', x: 25, y: 60, team: 'Argentina', discovered: false },
    { id: '5', x: 80, y: 30, team: 'Germany', discovered: false },
  ]);

  const handleScan = () => {
    if (fuel < 10) return;
    
    setIsScanning(true);
    setFuel(prev => Math.max(0, prev - 10));
    
    setTimeout(() => {
      setIsScanning(false);
      const undiscovered = discoveryPoints.filter(p => !p.discovered);
      if (undiscovered.length > 0) {
        const found = undiscovered[Math.floor(Math.random() * undiscovered.length)];
        setRevealedCard({
          id: found.id,
          team: found.team,
          player: 'Elite Player',
          rating: 85 + Math.floor(Math.random() * 15),
          rarity: Math.random() > 0.7 ? 'Legendary' : 'Rare'
        });
        setShowCardReveal(true);
        setXp(prev => prev + 100);
      }
    }, 2000);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      {/* World Map Background */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1723307061004-6e2e087deae1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMG1hcCUyMGRhcmslMjBzcGFjZSUyMGNvc21pY3xlbnwxfHx8fDE3NzAyNDg1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="World Map"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/80" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Discovery Points */}
      {discoveryPoints.map((point) => (
        <motion.div
          key={point.id}
          className="absolute"
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            <motion.div 
              className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
              animate={{
                boxShadow: [
                  '0 0 10px rgba(34, 211, 238, 0.5)',
                  '0 0 20px rgba(34, 211, 238, 0.8)',
                  '0 0 10px rgba(34, 211, 238, 0.5)'
                ]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
            />
            <motion.div 
              className="absolute inset-0 w-3 h-3 rounded-full border-2 border-cyan-400"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.8, 0, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            />
          </div>
        </motion.div>
      ))}

      {/* Scan Wave Effect */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-32 h-32 rounded-full border-4 border-cyan-400"
              animate={{
                scale: [0, 8],
                opacity: [1, 0]
              }}
              transition={{
                duration: 2,
                ease: "easeOut"
              }}
            />
            <motion.div
              className="absolute w-32 h-32 rounded-full border-4 border-purple-400"
              animate={{
                scale: [0, 8],
                opacity: [1, 0]
              }}
              transition={{
                duration: 2,
                delay: 0.3,
                ease: "easeOut"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex items-start justify-between gap-3">
          {/* Fuel Indicator */}
          <motion.div 
            className="flex-1 bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-cyan-500/30"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400">FUEL</span>
              <span className="ml-auto text-sm font-bold text-white">{fuel}%</span>
            </div>
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${fuel}%` }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* XP & Level */}
          <motion.div 
            className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-purple-500/30"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <span className="text-sm font-bold text-white">{level}</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-400">XP</span>
                </div>
                <span className="text-sm font-bold text-white">{xp.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scan Button */}
      <div className="absolute bottom-28 left-0 right-0 flex justify-center z-10">
        <motion.button
          onClick={handleScan}
          disabled={isScanning || fuel < 10}
          className={`relative px-8 py-4 rounded-full font-bold text-lg ${
            fuel < 10 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
          }`}
          whileHover={fuel >= 10 ? { scale: 1.05 } : {}}
          whileTap={fuel >= 10 ? { scale: 0.95 } : {}}
          animate={isScanning ? {
            boxShadow: [
              '0 10px 30px rgba(34, 211, 238, 0.5)',
              '0 10px 50px rgba(34, 211, 238, 0.8)',
              '0 10px 30px rgba(34, 211, 238, 0.5)'
            ]
          } : {}}
          transition={{ duration: 0.5, repeat: isScanning ? Infinity : 0 }}
        >
          <div className="flex items-center gap-2">
            <Radar className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'SCANNING...' : 'SCAN AREA'}</span>
          </div>
          {fuel >= 10 && (
            <motion.div 
              className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0"
              animate={{
                opacity: [0, 0.3, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            />
          )}
        </motion.button>
      </div>

      {/* Stats Footer */}
      <motion.div 
        className="absolute bottom-20 left-4 right-4 flex justify-around bg-slate-900/80 backdrop-blur-md rounded-2xl p-3 border border-slate-700/50"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-center">
          <MapPin className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
          <div className="text-xs text-slate-400">Discovered</div>
          <div className="text-sm font-bold text-white">0/5</div>
        </div>
        <div className="w-px bg-slate-700" />
        <div className="text-center">
          <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <div className="text-xs text-slate-400">Cards Found</div>
          <div className="text-sm font-bold text-white">0</div>
        </div>
        <div className="w-px bg-slate-700" />
        <div className="text-center">
          <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
          <div className="text-xs text-slate-400">Streak</div>
          <div className="text-sm font-bold text-white">0</div>
        </div>
      </motion.div>

      {/* Card Reveal Modal */}
      <AnimatePresence>
        {showCardReveal && revealedCard && (
          <CardReveal 
            card={revealedCard} 
            onClose={() => {
              setShowCardReveal(false);
              setRevealedCard(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
