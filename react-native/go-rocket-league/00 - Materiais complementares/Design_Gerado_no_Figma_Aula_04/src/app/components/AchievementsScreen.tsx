import { motion } from 'motion/react';
import { Trophy, Target, Zap, Lock, Check } from 'lucide-react';

export function AchievementsScreen() {
  const achievements = [
    {
      id: 1,
      title: 'First Discovery',
      description: 'Discover your first player card',
      icon: Trophy,
      progress: 1,
      total: 1,
      unlocked: true,
      rarity: 'common',
      reward: '50 XP'
    },
    {
      id: 2,
      title: 'World Explorer',
      description: 'Scan 10 different locations on the map',
      icon: Target,
      progress: 3,
      total: 10,
      unlocked: false,
      rarity: 'rare',
      reward: '200 XP'
    },
    {
      id: 3,
      title: 'Speed Collector',
      description: 'Discover 3 cards in one day',
      icon: Zap,
      progress: 0,
      total: 3,
      unlocked: false,
      rarity: 'rare',
      reward: '150 XP'
    },
    {
      id: 4,
      title: 'Legendary Hunter',
      description: 'Collect 5 legendary cards',
      icon: Trophy,
      progress: 1,
      total: 5,
      unlocked: false,
      rarity: 'legendary',
      reward: '500 XP'
    },
    {
      id: 5,
      title: 'Trade Master',
      description: 'Complete 10 successful trades',
      icon: Target,
      progress: 2,
      total: 10,
      unlocked: false,
      rarity: 'epic',
      reward: '300 XP'
    },
    {
      id: 6,
      title: 'Fuel Efficient',
      description: 'Discover a card with less than 20% fuel',
      icon: Zap,
      progress: 0,
      total: 1,
      unlocked: false,
      rarity: 'rare',
      reward: '100 XP'
    }
  ];

  const rarityColors = {
    common: 'from-slate-500 to-slate-600',
    rare: 'from-blue-500 to-cyan-500',
    epic: 'from-purple-500 to-pink-500',
    legendary: 'from-amber-500 to-yellow-500'
  };

  const rarityBorder = {
    common: 'border-slate-600',
    rare: 'border-cyan-500',
    epic: 'border-purple-500',
    legendary: 'border-amber-500'
  };

  const stats = [
    { label: 'Total XP Earned', value: '2,450', color: 'text-purple-400' },
    { label: 'Achievements Unlocked', value: '1/6', color: 'text-cyan-400' },
    { label: 'Completion Rate', value: '16%', color: 'text-green-400' }
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
          <h1 className="text-3xl font-bold text-white mb-2">Achievements</h1>
          <p className="text-slate-400">Track your progress and earn rewards</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-3 gap-3 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-3"
              whileHover={{ y: -3 }}
            >
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Achievement Categories */}
        <motion.div
          className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {['All', 'Unlocked', 'Locked', 'Legendary'].map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap ${
                category === 'All'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Achievements List */}
        <div className="space-y-3">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            const progressPercentage = (achievement.progress / achievement.total) * 100;
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`relative bg-slate-900 rounded-2xl p-4 border-2 overflow-hidden ${
                  achievement.unlocked 
                    ? rarityBorder[achievement.rarity as keyof typeof rarityBorder]
                    : 'border-slate-800'
                }`}
              >
                {/* Background Gradient for Unlocked */}
                {achievement.unlocked && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${rarityColors[achievement.rarity as keyof typeof rarityColors]} opacity-5`} />
                )}

                <div className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div className={`relative flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${
                    achievement.unlocked
                      ? `bg-gradient-to-br ${rarityColors[achievement.rarity as keyof typeof rarityColors]}`
                      : 'bg-slate-800'
                  }`}>
                    <Icon className={`w-7 h-7 ${achievement.unlocked ? 'text-white' : 'text-slate-600'}`} />
                    {achievement.unlocked && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-slate-900"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.5 + index * 0.1 }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                    {!achievement.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-slate-600" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-slate-500'}`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm mt-0.5 ${achievement.unlocked ? 'text-slate-400' : 'text-slate-600'}`}>
                          {achievement.description}
                        </p>
                      </div>
                      <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                        achievement.unlocked
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {achievement.reward}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {!achievement.unlocked && (
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.total}</span>
                        </div>
                        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${rarityColors[achievement.rarity as keyof typeof rarityColors]}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          />
                        </div>
                      </div>
                    )}

                    {achievement.unlocked && (
                      <div className="flex items-center gap-2 text-xs text-green-400">
                        <Check className="w-3 h-3" />
                        <span className="font-semibold">Unlocked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shimmer effect for unlocked achievements */}
                {achievement.unlocked && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{
                      duration: 2,
                      delay: 1 + index * 0.1,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
