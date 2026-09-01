import { motion } from 'motion/react';
import { Settings, Share2, Star, Trophy, Zap, MapPin, Crown, Edit } from 'lucide-react';

interface ProfileScreenProps {
  onEditProfile?: () => void;
}

export function ProfileScreen({ onEditProfile }: ProfileScreenProps) {
  const userStats = [
    { icon: Star, label: 'Total Cards', value: '6', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    { icon: Trophy, label: 'Achievements', value: '1', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
    { icon: Zap, label: 'Total XP', value: '2,450', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
    { icon: MapPin, label: 'Locations', value: '5', color: 'text-green-400', bgColor: 'bg-green-500/20' }
  ];

  const recentActivity = [
    { action: 'Discovered', item: 'Neymar Jr.', team: 'Brazil', time: '2 hours ago', type: 'discovery' },
    { action: 'Traded', item: 'Vinicius Jr.', team: 'Brazil', time: '5 hours ago', type: 'trade' },
    { action: 'Unlocked', item: 'First Discovery', team: 'Achievement', time: '1 day ago', type: 'achievement' }
  ];

  const badges = [
    { name: 'Early Explorer', icon: MapPin, unlocked: true, color: 'from-cyan-500 to-blue-500' },
    { name: 'Trade Master', icon: Share2, unlocked: false, color: 'from-purple-500 to-pink-500' },
    { name: 'Legendary', icon: Crown, unlocked: false, color: 'from-amber-500 to-yellow-500' },
    { name: 'Speed Runner', icon: Zap, unlocked: false, color: 'from-green-500 to-emerald-500' }
  ];

  return (
    <div className="h-full bg-slate-950 overflow-y-auto">
      <div className="p-4 pb-24">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Profile</h1>
            <p className="text-slate-400">View your stats and progress</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          className="relative bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-3xl p-6 mb-6 overflow-hidden"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            }} />
          </div>

          <div className="relative flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">R</span>
              </div>
              <motion.div
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-slate-900"
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-xs font-bold text-white">12</span>
              </motion.div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white">RocketPlayer</h2>
                <button className="w-6 h-6 rounded-lg bg-slate-900/50 flex items-center justify-center" onClick={onEditProfile}>
                  <Edit className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              <p className="text-cyan-400 text-sm font-semibold mb-2">Level 12 Explorer</p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-slate-900" />
                  ))}
                </div>
                <span className="text-xs text-slate-400">+3 friends</span>
              </div>
            </div>

            {/* Share Button */}
            <button className="w-10 h-10 rounded-xl bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
              <Share2 className="w-5 h-5 text-cyan-400" />
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-2 gap-3 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {userStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className={`${stat.bgColor} border border-slate-800 rounded-2xl p-4`}
                whileHover={{ y: -3 }}
              >
                <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Badges Section */}
        <motion.div
          className="mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-white mb-3">Badges</h3>
          <div className="grid grid-cols-4 gap-3">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center"
                  whileHover={badge.unlocked ? { y: -3 } : {}}
                >
                  <div className={`relative w-full aspect-square rounded-2xl flex items-center justify-center mb-2 ${
                    badge.unlocked
                      ? `bg-gradient-to-br ${badge.color}`
                      : 'bg-slate-900 border border-slate-800'
                  }`}>
                    <Icon className={`w-6 h-6 ${badge.unlocked ? 'text-white' : 'text-slate-700'}`} />
                    {!badge.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-2xl">
                        <div className="w-4 h-4 border-2 border-slate-700 rounded" />
                      </div>
                    )}
                  </div>
                  <div className={`text-xs font-semibold ${badge.unlocked ? 'text-white' : 'text-slate-600'}`}>
                    {badge.name}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-white mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activity.type === 'discovery' ? 'bg-cyan-500/20' :
                    activity.type === 'trade' ? 'bg-purple-500/20' :
                    'bg-amber-500/20'
                  }`}>
                    {activity.type === 'discovery' && <Star className="w-5 h-5 text-cyan-400" />}
                    {activity.type === 'trade' && <Share2 className="w-5 h-5 text-purple-400" />}
                    {activity.type === 'achievement' && <Trophy className="w-5 h-5 text-amber-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">{activity.action}</span>
                      <span className="font-bold text-white text-sm">{activity.item}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{activity.team}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="grid grid-cols-2 gap-3 mt-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button className="bg-slate-900 border border-slate-800 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 transition-all" onClick={onEditProfile}>
            Edit Profile
          </button>
          <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-2xl font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all">
            Share Profile
          </button>
        </motion.div>
      </div>
    </div>
  );
}