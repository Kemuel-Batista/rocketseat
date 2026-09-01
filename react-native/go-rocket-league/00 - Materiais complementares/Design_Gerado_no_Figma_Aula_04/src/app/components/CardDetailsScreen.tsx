import { motion } from 'motion/react';
import { ArrowLeft, Star, Zap, Trophy, Heart, Share2, TrendingUp, Shield, Target } from 'lucide-react';
import { useState } from 'react';

interface CardDetailsScreenProps {
  onBack: () => void;
}

export function CardDetailsScreen({ onBack }: CardDetailsScreenProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const card = {
    player: 'Neymar Jr.',
    team: 'Brazil',
    position: 'Forward',
    rating: 92,
    rarity: 'Legendary',
    image: 'https://images.unsplash.com/photo-1761225091881-0d3bda9f6d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBwbGF5ZXIlMjBhY3Rpb24lMjBzcG9ydHN8ZW58MXx8fHwxNzcwMjQ4NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    stats: {
      speed: 95,
      shooting: 89,
      passing: 91,
      dribbling: 96,
      defense: 62,
      physical: 78
    },
    marketValue: '2,500 XP',
    ownedBy: 'Você',
    discoveredAt: 'São Paulo, Brazil',
    discoveredDate: '04 Fev 2026'
  };

  const stats = [
    { name: 'Velocidade', value: card.stats.speed, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500' },
    { name: 'Finalização', value: card.stats.shooting, icon: Target, color: 'text-red-400', bg: 'bg-red-500' },
    { name: 'Passe', value: card.stats.passing, icon: Share2, color: 'text-green-400', bg: 'bg-green-500' },
    { name: 'Drible', value: card.stats.dribbling, icon: Star, color: 'text-purple-400', bg: 'bg-purple-500' },
    { name: 'Defesa', value: card.stats.defense, icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500' },
    { name: 'Físico', value: card.stats.physical, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500' }
  ];

  return (
    <div className="h-full bg-slate-950 overflow-y-auto">
      <div className="pb-24">
        {/* Hero Section with Card */}
        <div className="relative h-96 overflow-hidden">
          {/* Background Image */}
          <img 
            src={card.image}
            alt={card.player}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
            <motion.button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>

            <div className="flex gap-2">
              <motion.button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center ${
                  isFavorite 
                    ? 'bg-red-500/80 border-red-400' 
                    : 'bg-slate-900/80 border-slate-800'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'text-white fill-white' : 'text-white'}`} />
              </motion.button>

              <motion.button
                className="w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Share2 className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Card Rating & Rarity */}
          <div className="absolute bottom-6 left-4 right-4 z-10">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-end justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center gap-1">
                    <Star className="w-3 h-3 text-white fill-white" />
                    <span className="text-xs font-bold text-white">{card.rarity}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700">
                    <span className="text-xs font-semibold text-cyan-400">{card.position}</span>
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-white mb-1">{card.player}</h1>
                <p className="text-xl text-cyan-400 font-semibold">{card.team}</p>
              </div>

              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 border-4 border-slate-950">
                <span className="text-3xl font-bold text-white">{card.rating}</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div 
          className="p-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Estatísticas</h2>
          <div className="space-y-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${stat.bg}/20 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <span className="font-semibold text-white">{stat.name}</span>
                    </div>
                    <span className="text-xl font-bold text-white">{stat.value}</span>
                  </div>
                  <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`absolute inset-y-0 left-0 ${stat.bg} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.05 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Card Info */}
        <motion.div
          className="p-4 pt-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Informações da Carta</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Valor de Mercado</span>
              <span className="font-bold text-white">{card.marketValue}</span>
            </div>
            <div className="h-px bg-slate-800" />
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Proprietário</span>
              <span className="font-bold text-cyan-400">{card.ownedBy}</span>
            </div>
            <div className="h-px bg-slate-800" />
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Descoberto em</span>
              <span className="font-bold text-white">{card.discoveredAt}</span>
            </div>
            <div className="h-px bg-slate-800" />
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Data de Descoberta</span>
              <span className="font-bold text-white">{card.discoveredDate}</span>
            </div>
          </div>
        </motion.div>

        {/* Similar Cards */}
        <motion.div
          className="p-4 pt-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Cartas Similares</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-32">
                <div className="relative rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                  <div className="relative bg-slate-900 rounded-2xl overflow-hidden">
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1649693710813-e4eedb415669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHBsYXllciUyMHN0YWRpdW18ZW58MXx8fHwxNzcwMjMzNDExfDA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Player"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                      <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-slate-900/90 backdrop-blur-sm border-2 border-purple-400 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">89</span>
                      </div>
                    </div>
                    <div className="p-2">
                      <h3 className="font-bold text-white text-xs truncate">Vinicius Jr.</h3>
                      <p className="text-purple-400 text-xs font-semibold">Brazil</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="p-4 grid grid-cols-2 gap-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-500/30">
            Trocar Carta
          </button>
          <button className="bg-slate-900 border border-slate-800 text-white py-4 rounded-2xl font-bold">
            Ver no Mercado
          </button>
        </motion.div>
      </div>
    </div>
  );
}
