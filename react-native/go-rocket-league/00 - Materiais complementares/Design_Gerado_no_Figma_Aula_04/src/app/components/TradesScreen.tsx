import { motion } from 'motion/react';
import { ArrowRightLeft, Clock, TrendingUp, Star, ChevronRight } from 'lucide-react';

interface TradesScreenProps {
  onCreateTrade?: () => void;
}

export function TradesScreen({ onCreateTrade }: TradesScreenProps) {
  const activeTrades = [
    {
      id: 1,
      offeringPlayer: 'Vinicius Jr.',
      offeringTeam: 'Brazil',
      offeringRating: 89,
      requestingPlayer: 'Haaland',
      requestingTeam: 'Norway',
      requestingRating: 91,
      timeLeft: '2h 30m',
      status: 'pending'
    },
    {
      id: 2,
      offeringPlayer: 'Pedri',
      offeringTeam: 'Spain',
      offeringRating: 87,
      requestingPlayer: 'Gavi',
      requestingTeam: 'Spain',
      requestingRating: 85,
      timeLeft: '5h 15m',
      status: 'pending'
    }
  ];

  const availableTrades = [
    {
      id: 3,
      player: 'Kevin De Bruyne',
      team: 'England',
      rating: 91,
      requestedRating: 90,
      trader: 'RocketKing99'
    },
    {
      id: 4,
      player: 'Lewandowski',
      team: 'Poland',
      rating: 90,
      requestedRating: 88,
      trader: 'FootballPro'
    },
    {
      id: 5,
      player: 'Son Heung-min',
      team: 'South Korea',
      rating: 88,
      requestedRating: 87,
      trader: 'CardCollector'
    }
  ];

  return (
    <div className="h-full bg-slate-950 overflow-y-auto">
      <div className="p-4 pb-24">
        {/* Header */}
        <motion.div 
          className="mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Trades</h1>
          <p className="text-slate-400">Exchange cards with other players</p>
        </motion.div>

        {/* Trade Stats */}
        <motion.div 
          className="grid grid-cols-2 gap-3 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400">ACTIVE</span>
            </div>
            <div className="text-2xl font-bold text-white">{activeTrades.length}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-400">COMPLETED</span>
            </div>
            <div className="text-2xl font-bold text-white">12</div>
          </div>
        </motion.div>

        {/* Active Trades Section */}
        <motion.div 
          className="mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-white mb-3">Active Trades</h2>
          <div className="space-y-3">
            {activeTrades.map((trade, index) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-xs font-semibold text-yellow-400">PENDING</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{trade.timeLeft}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Offering Card */}
                  <div className="flex-1 bg-slate-800 rounded-xl p-3">
                    <div className="text-xs text-slate-400 mb-1">You Offer</div>
                    <div className="font-bold text-white text-sm">{trade.offeringPlayer}</div>
                    <div className="text-xs text-cyan-400">{trade.offeringTeam}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold text-white">{trade.offeringRating}</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <ArrowRightLeft className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Requesting Card */}
                  <div className="flex-1 bg-slate-800 rounded-xl p-3">
                    <div className="text-xs text-slate-400 mb-1">You Get</div>
                    <div className="font-bold text-white text-sm">{trade.requestingPlayer}</div>
                    <div className="text-xs text-purple-400">{trade.requestingTeam}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold text-white">{trade.requestingRating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 py-2 rounded-xl font-semibold text-sm hover:bg-red-500/30 transition-all">
                    Cancel
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-xl font-semibold text-sm shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Available Trades Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-white mb-3">Available Trades</h2>
          <div className="space-y-3">
            {availableTrades.map((trade, index) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ x: 5 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{trade.rating}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">{trade.player}</div>
                      <div className="text-xs text-purple-400">{trade.team}</div>
                      <div className="text-xs text-slate-500 mt-0.5">by {trade.trader}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Wants</div>
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-white">{trade.requestedRating}+</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Create Trade Button */}
        <motion.button
          className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-cyan-500/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onCreateTrade}
        >
          Create New Trade
        </motion.button>
      </div>
    </div>
  );
}