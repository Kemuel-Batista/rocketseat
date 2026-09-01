import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, ArrowRightLeft, Star, ChevronRight, Check, X } from 'lucide-react';
import { useState } from 'react';

interface CreateTradeScreenProps {
  onBack: () => void;
}

export function CreateTradeScreen({ onBack }: CreateTradeScreenProps) {
  const [step, setStep] = useState<'offer' | 'request' | 'confirm'>('offer');
  const [selectedOfferCard, setSelectedOfferCard] = useState<any>(null);
  const [selectedRequestCard, setSelectedRequestCard] = useState<any>(null);
  const [tradeMessage, setTradeMessage] = useState('');
  const [showCardSelector, setShowCardSelector] = useState(false);
  const [selectorMode, setSelectorMode] = useState<'offer' | 'request'>('offer');

  const myCards = [
    { id: 1, player: 'Vinicius Jr.', team: 'Brazil', rating: 89, rarity: 'Rare' },
    { id: 2, player: 'Pedri', team: 'Spain', rating: 87, rarity: 'Rare' },
    { id: 3, player: 'Neymar Jr.', team: 'Brazil', rating: 92, rarity: 'Legendary' },
    { id: 4, player: 'K. De Bruyne', team: 'England', rating: 91, rarity: 'Rare' }
  ];

  const availableCards = [
    { id: 5, player: 'Haaland', team: 'Norway', rating: 91, rarity: 'Legendary', owner: 'RocketKing99' },
    { id: 6, player: 'Mbappé', team: 'France', rating: 95, rarity: 'Legendary', owner: 'FootballPro' },
    { id: 7, player: 'Bellingham', team: 'England', rating: 88, rarity: 'Rare', owner: 'CardMaster' },
    { id: 8, player: 'Gavi', team: 'Spain', rating: 85, rarity: 'Rare', owner: 'TradeExpert' }
  ];

  const rarityColors = {
    'Legendary': 'from-amber-500 to-yellow-500',
    'Rare': 'from-purple-500 to-pink-500',
    'Common': 'from-blue-500 to-cyan-500'
  };

  const openCardSelector = (mode: 'offer' | 'request') => {
    setSelectorMode(mode);
    setShowCardSelector(true);
  };

  const selectCard = (card: any) => {
    if (selectorMode === 'offer') {
      setSelectedOfferCard(card);
      setStep('request');
    } else {
      setSelectedRequestCard(card);
      setStep('confirm');
    }
    setShowCardSelector(false);
  };

  const CardSelector = () => (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25 }}
      className="fixed inset-0 z-50 bg-slate-950"
    >
      <div className="h-full overflow-y-auto pb-24">
        <div className="sticky top-0 z-20 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={() => setShowCardSelector(false)}
              className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">
              {selectorMode === 'offer' ? 'Selecione sua Carta' : 'Selecione Carta Desejada'}
            </h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar cartas..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-3">
            {(selectorMode === 'offer' ? myCards : availableCards).map((card) => (
              <motion.button
                key={card.id}
                onClick={() => selectCard(card)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rarityColors[card.rarity as keyof typeof rarityColors]} flex items-center justify-center`}>
                    <span className="text-lg font-bold text-white">{card.rating}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white">{card.player}</div>
                    <div className="text-sm text-purple-400">{card.team}</div>
                    {'owner' in card && (
                      <div className="text-xs text-slate-500">by {card.owner}</div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full bg-slate-950 overflow-y-auto">
      <div className="pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Nova Troca</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Progress Steps */}
        <motion.div 
          className="p-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center justify-between mb-2">
            {['Oferecer', 'Solicitar', 'Confirmar'].map((label, index) => {
              const isActive = 
                (step === 'offer' && index === 0) ||
                (step === 'request' && index === 1) ||
                (step === 'confirm' && index === 2);
              const isCompleted = 
                (step === 'request' && index === 0) ||
                (step === 'confirm' && index <= 1);

              return (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      isActive ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30' :
                      isCompleted ? 'bg-green-500 text-white' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                    </div>
                    <span className={`text-xs mt-1 font-semibold ${
                      isActive ? 'text-cyan-400' : isCompleted ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      {label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`h-1 flex-1 mx-2 rounded-full ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-800'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Step Content */}
        <div className="p-4">
          {/* Step 1: Offer Card */}
          {step === 'offer' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">Selecione sua Carta</h2>
              <p className="text-slate-400 mb-6">Escolha a carta que você deseja oferecer na troca</p>

              {selectedOfferCard ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-6"
                >
                  <div className={`relative rounded-2xl bg-gradient-to-br ${rarityColors[selectedOfferCard.rarity as keyof typeof rarityColors]} p-0.5`}>
                    <div className="relative bg-slate-900 rounded-2xl overflow-hidden p-6">
                      <button
                        onClick={() => setSelectedOfferCard(null)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${rarityColors[selectedOfferCard.rarity as keyof typeof rarityColors]} flex items-center justify-center`}>
                          <span className="text-2xl font-bold text-white">{selectedOfferCard.rating}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{selectedOfferCard.player}</h3>
                          <p className="text-purple-400 font-semibold">{selectedOfferCard.team}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => openCardSelector('offer')}
                  className="w-full border-2 border-dashed border-slate-700 rounded-2xl p-12 mb-6 hover:border-cyan-500 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-3">
                      <Star className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-semibold">Toque para selecionar uma carta</p>
                  </div>
                </button>
              )}

              <button
                onClick={() => selectedOfferCard && setStep('request')}
                disabled={!selectedOfferCard}
                className={`w-full py-4 rounded-2xl font-bold ${
                  selectedOfferCard
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Continuar
              </button>
            </motion.div>
          )}

          {/* Step 2: Request Card */}
          {step === 'request' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">Carta Desejada</h2>
              <p className="text-slate-400 mb-6">Escolha qual carta você deseja receber</p>

              {selectedRequestCard ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-6"
                >
                  <div className={`relative rounded-2xl bg-gradient-to-br ${rarityColors[selectedRequestCard.rarity as keyof typeof rarityColors]} p-0.5`}>
                    <div className="relative bg-slate-900 rounded-2xl overflow-hidden p-6">
                      <button
                        onClick={() => setSelectedRequestCard(null)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${rarityColors[selectedRequestCard.rarity as keyof typeof rarityColors]} flex items-center justify-center`}>
                          <span className="text-2xl font-bold text-white">{selectedRequestCard.rating}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{selectedRequestCard.player}</h3>
                          <p className="text-purple-400 font-semibold">{selectedRequestCard.team}</p>
                          <p className="text-xs text-slate-500">by {selectedRequestCard.owner}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => openCardSelector('request')}
                  className="w-full border-2 border-dashed border-slate-700 rounded-2xl p-12 mb-6 hover:border-cyan-500 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-3">
                      <Star className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-semibold">Toque para selecionar uma carta</p>
                  </div>
                </button>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('offer')}
                  className="flex-1 bg-slate-900 border border-slate-800 text-white py-4 rounded-2xl font-bold"
                >
                  Voltar
                </button>
                <button
                  onClick={() => selectedRequestCard && setStep('confirm')}
                  disabled={!selectedRequestCard}
                  className={`flex-1 py-4 rounded-2xl font-bold ${
                    selectedRequestCard
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && selectedOfferCard && selectedRequestCard && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">Confirmar Troca</h2>
              <p className="text-slate-400 mb-6">Revise os detalhes antes de enviar a proposta</p>

              {/* Trade Preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1">
                    <div className="text-xs text-slate-400 mb-2">Você Oferece</div>
                    <div className="bg-slate-800 rounded-xl p-3">
                      <div className="font-bold text-white">{selectedOfferCard.player}</div>
                      <div className="text-sm text-purple-400">{selectedOfferCard.team}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-white">{selectedOfferCard.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <ArrowRightLeft className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-xs text-slate-400 mb-2">Você Recebe</div>
                    <div className="bg-slate-800 rounded-xl p-3">
                      <div className="font-bold text-white">{selectedRequestCard.player}</div>
                      <div className="text-sm text-purple-400">{selectedRequestCard.team}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-white">{selectedRequestCard.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Mensagem (opcional)
                </label>
                <textarea
                  value={tradeMessage}
                  onChange={(e) => setTradeMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                  placeholder="Adicione uma mensagem para o jogador..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('request')}
                  className="flex-1 bg-slate-900 border border-slate-800 text-white py-4 rounded-2xl font-bold"
                >
                  Voltar
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-cyan-500/30"
                >
                  Enviar Proposta
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Card Selector Modal */}
      <AnimatePresence>
        {showCardSelector && <CardSelector />}
      </AnimatePresence>
    </div>
  );
}
