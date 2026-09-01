import { motion } from 'motion/react';
import { Star, Filter, Search, Grid3x3, List } from 'lucide-react';
import { useState } from 'react';

interface CollectionScreenProps {
  onCardClick?: () => void;
}

export function CollectionScreen({ onCardClick }: CollectionScreenProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const teams = ['All', 'Brazil', 'France', 'Germany', 'Argentina', 'Spain', 'England'];
  
  const cards = [
    { id: 1, player: 'Neymar Jr.', team: 'Brazil', rating: 92, rarity: 'Legendary', image: 'https://images.unsplash.com/photo-1761225091881-0d3bda9f6d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBwbGF5ZXIlMjBhY3Rpb24lMjBzcG9ydHN8ZW58MXx8fHwxNzcwMjQ4NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 2, player: 'Kylian Mbappé', team: 'France', rating: 95, rarity: 'Legendary', image: 'https://images.unsplash.com/photo-1649693710813-e4eedb415669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHBsYXllciUyMHN0YWRpdW18ZW58MXx8fHwxNzcwMjMzNDExfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 3, player: 'L. Messi', team: 'Argentina', rating: 94, rarity: 'Legendary', image: 'https://images.unsplash.com/photo-1761225091881-0d3bda9f6d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBwbGF5ZXIlMjBhY3Rpb24lMjBzcG9ydHN8ZW58MXx8fHwxNzcwMjQ4NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 4, player: 'K. De Bruyne', team: 'England', rating: 91, rarity: 'Rare', image: 'https://images.unsplash.com/photo-1649693710813-e4eedb415669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHBsYXllciUyMHN0YWRpdW18ZW58MXx8fHwxNzcwMjMzNDExfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 5, player: 'Vinicius Jr.', team: 'Brazil', rating: 89, rarity: 'Rare', image: 'https://images.unsplash.com/photo-1761225091881-0d3bda9f6d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBwbGF5ZXIlMjBhY3Rpb24lMjBzcG9ydHN8ZW58MXx8fHwxNzcwMjQ4NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 6, player: 'Pedri', team: 'Spain', rating: 87, rarity: 'Rare', image: 'https://images.unsplash.com/photo-1649693710813-e4eedb415669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHBsYXllciUyMHN0YWRpdW18ZW58MXx8fHwxNzcwMjMzNDExfDA&ixlib=rb-4.1.0&q=80&w=1080' },
  ];

  const filteredCards = selectedTeam === 'All' 
    ? cards 
    : cards.filter(card => card.team === selectedTeam);

  const rarityColors = {
    'Legendary': 'from-amber-500 to-yellow-500',
    'Rare': 'from-purple-500 to-pink-500',
    'Common': 'from-blue-500 to-cyan-500'
  };

  return (
    <div className="h-full bg-slate-950 overflow-y-auto">
      <div className="p-4 pb-24">
        {/* Header */}
        <motion.div 
          className="mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Collection</h1>
          <p className="text-slate-400">Manage your player cards</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="relative mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search players..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </motion.div>

        {/* Team Filter */}
        <motion.div 
          className="mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-400">FILTER BY TEAM</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {teams.map((team) => (
              <motion.button
                key={team}
                onClick={() => setSelectedTeam(team)}
                className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                  selectedTeam === team
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {team}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-3 gap-3 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
            <div className="text-2xl font-bold text-white">{cards.length}</div>
            <div className="text-xs text-slate-400">Total Cards</div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
            <div className="text-2xl font-bold text-amber-400">3</div>
            <div className="text-xs text-slate-400">Legendary</div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
            <div className="text-2xl font-bold text-purple-400">3</div>
            <div className="text-xs text-slate-400">Rare</div>
          </div>
        </motion.div>

        {/* View Mode Toggle */}
        <motion.div 
          className="flex items-center justify-between mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-cyan-400">VISUALIZAÇÃO</span>
          </div>
          <div className="flex gap-2 bg-slate-900 border border-slate-800 rounded-full p-1">
            <motion.button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'text-slate-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Grid3x3 className="w-4 h-4" />
              Grid
            </motion.button>
            <motion.button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 transition-all ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'text-slate-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List className="w-4 h-4" />
              Lista
            </motion.button>
          </div>
        </motion.div>

        {/* Card Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="cursor-pointer"
                onClick={onCardClick}
              >
                <div className={`relative rounded-2xl bg-gradient-to-br ${rarityColors[card.rarity as keyof typeof rarityColors]} p-0.5`}>
                  <div className="relative bg-slate-900 rounded-2xl overflow-hidden">
                    {/* Card Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={card.image}
                        alt={card.player}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                      
                      {/* Rating Badge */}
                      <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-slate-900/90 backdrop-blur-sm border-2 border-cyan-400 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{card.rating}</span>
                      </div>

                      {/* Rarity Badge */}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full bg-gradient-to-r ${rarityColors[card.rarity as keyof typeof rarityColors]} flex items-center gap-1`}>
                        <Star className="w-2 h-2 text-white fill-white" />
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="p-3">
                      <h3 className="font-bold text-white text-sm mb-0.5 truncate">{card.player}</h3>
                      <p className="text-cyan-400 text-xs font-semibold">{card.team}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 5 }}
                className="cursor-pointer"
                onClick={onCardClick}
              >
                <div className={`relative rounded-2xl bg-gradient-to-br ${rarityColors[card.rarity as keyof typeof rarityColors]} p-0.5`}>
                  <div className="relative bg-slate-900 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      {/* Card Image */}
                      <div className="relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={card.image}
                          alt={card.player}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                      </div>

                      {/* Card Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg mb-1 truncate">{card.player}</h3>
                        <p className="text-cyan-400 text-sm font-semibold mb-2">{card.team}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-semibold text-slate-400">{card.rarity}</span>
                          </div>
                        </div>
                      </div>

                      {/* Rating Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center border-2 border-slate-950">
                          <span className="text-xl font-bold text-white">{card.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredCards.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-20 h-20 rounded-full bg-slate-900 mx-auto mb-4 flex items-center justify-center">
              <Star className="w-10 h-10 text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No cards found</h3>
            <p className="text-slate-400">Try exploring the map to discover new players</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}