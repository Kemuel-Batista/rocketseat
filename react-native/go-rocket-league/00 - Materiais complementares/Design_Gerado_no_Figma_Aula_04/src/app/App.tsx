import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Star, ArrowRightLeft, Trophy, User } from 'lucide-react';
import { MapScreen } from './components/MapScreen';
import { CollectionScreen } from './components/CollectionScreen';
import { TradesScreen } from './components/TradesScreen';
import { AchievementsScreen } from './components/AchievementsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { EditProfileScreen } from './components/EditProfileScreen';
import { CardDetailsScreen } from './components/CardDetailsScreen';
import { CreateTradeScreen } from './components/CreateTradeScreen';

type TabType = 'map' | 'collection' | 'trades' | 'achievements' | 'profile';
type ModalScreen = 'editProfile' | 'cardDetails' | 'createTrade' | null;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [modalScreen, setModalScreen] = useState<ModalScreen>(null);

  const tabs = [
    { id: 'map' as TabType, icon: Map, label: 'Map' },
    { id: 'collection' as TabType, icon: Star, label: 'Collection' },
    { id: 'trades' as TabType, icon: ArrowRightLeft, label: 'Trades' },
    { id: 'achievements' as TabType, icon: Trophy, label: 'Achievements' },
    { id: 'profile' as TabType, icon: User, label: 'Profile' }
  ];

  const renderScreen = () => {
    switch (activeTab) {
      case 'map':
        return <MapScreen />;
      case 'collection':
        return <CollectionScreen onCardClick={() => setModalScreen('cardDetails')} />;
      case 'trades':
        return <TradesScreen onCreateTrade={() => setModalScreen('createTrade')} />;
      case 'achievements':
        return <AchievementsScreen />;
      case 'profile':
        return <ProfileScreen onEditProfile={() => setModalScreen('editProfile')} />;
      default:
        return <MapScreen />;
    }
  };

  const renderModal = () => {
    switch (modalScreen) {
      case 'editProfile':
        return <EditProfileScreen onBack={() => setModalScreen(null)} />;
      case 'cardDetails':
        return <CardDetailsScreen onBack={() => setModalScreen(null)} />;
      case 'createTrade':
        return <CreateTradeScreen onBack={() => setModalScreen(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col max-w-md mx-auto">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!modalScreen && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderScreen()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Screens */}
      <AnimatePresence mode="wait">
        {modalScreen && (
          <motion.div
            key={modalScreen}
            className="absolute inset-0 z-50 bg-slate-950"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {renderModal()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Tab Navigation */}
      {!modalScreen && (
        <motion.div 
          className="relative bg-slate-900/95 backdrop-blur-xl border-t border-slate-800"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Glow Effect */}
          <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
          
          <div className="flex items-center justify-around px-2 py-3 safe-area-bottom">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-2xl transition-all"
                  whileTap={{ scale: 0.9 }}
                >
                  {/* Active Background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Icon Container */}
                  <div className="relative z-10">
                    <Icon 
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-500'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    
                    {/* Active Indicator Dot */}
                    {isActive && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full bg-cyan-400"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Label */}
                  <span 
                    className={`relative z-10 text-xs font-semibold transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
