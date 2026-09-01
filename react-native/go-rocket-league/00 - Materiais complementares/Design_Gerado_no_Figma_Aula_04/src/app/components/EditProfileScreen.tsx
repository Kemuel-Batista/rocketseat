import { motion } from 'motion/react';
import { ArrowLeft, Camera, Save, Mail, Globe, Calendar, MapPin, Instagram, Twitter } from 'lucide-react';
import { useState } from 'react';

interface EditProfileScreenProps {
  onBack: () => void;
}

export function EditProfileScreen({ onBack }: EditProfileScreenProps) {
  const [formData, setFormData] = useState({
    username: 'RocketPlayer',
    email: 'rocket@gorocketleague.com',
    bio: 'Level 12 Explorer | Card Collector',
    location: 'São Paulo, Brazil',
    website: 'gorocketleague.com',
    birthday: '1995-06-15',
    instagram: '@rocketplayer',
    twitter: '@rocketplayer'
  });

  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  const avatarColors = [
    'from-cyan-500 to-blue-500',
    'from-purple-500 to-pink-500',
    'from-amber-500 to-yellow-500',
    'from-green-500 to-emerald-500',
    'from-red-500 to-orange-500',
    'from-indigo-500 to-purple-500'
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
            <h1 className="text-xl font-bold text-white">Editar Perfil</h1>
            <button className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Save className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Avatar Section */}
        <motion.div 
          className="p-6 pb-8 border-b border-slate-800"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-4xl font-bold text-white">R</span>
              </div>
              <motion.button
                onClick={() => setShowAvatarOptions(!showAvatarOptions)}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Camera className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {showAvatarOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 mb-4"
              >
                {avatarColors.map((color, index) => (
                  <motion.button
                    key={index}
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </motion.div>
            )}

            <p className="text-sm text-slate-400">Toque para alterar avatar</p>
          </div>
        </motion.div>

        {/* Form Fields */}
        <div className="p-4 space-y-4">
          {/* Username */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-semibold text-slate-400 mb-2">
              Nome de Usuário
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Seu nome de usuário"
            />
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-semibold text-slate-400 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="seu@email.com"
              />
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-semibold text-slate-400 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              placeholder="Conte sobre você..."
            />
            <div className="text-xs text-slate-500 mt-1 text-right">
              {formData.bio.length}/150
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-semibold text-slate-400 mb-2">
              Localização
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Cidade, País"
              />
            </div>
          </motion.div>

          {/* Website */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-semibold text-slate-400 mb-2">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="seusite.com"
              />
            </div>
          </motion.div>

          {/* Birthday */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-sm font-semibold text-slate-400 mb-2">
              Data de Nascimento
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => handleChange('birthday', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="text-lg font-bold text-white mb-3">Redes Sociais</h3>
            
            <div className="space-y-3">
              {/* Instagram */}
              <div className="relative">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                  placeholder="@instagram"
                />
              </div>

              {/* Twitter */}
              <div className="relative">
                <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => handleChange('twitter', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="@twitter"
                />
              </div>
            </div>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-4"
          >
            <h3 className="text-lg font-bold text-white mb-3">Privacidade</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div>
                  <div className="font-semibold text-white">Perfil Público</div>
                  <div className="text-sm text-slate-400">Todos podem ver seu perfil</div>
                </div>
                <div className="w-12 h-6 bg-cyan-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div>
                  <div className="font-semibold text-white">Mostrar Coleção</div>
                  <div className="text-sm text-slate-400">Exibir suas cartas</div>
                </div>
                <div className="w-12 h-6 bg-cyan-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div>
                  <div className="font-semibold text-white">Permitir Trades</div>
                  <div className="text-sm text-slate-400">Receber propostas de troca</div>
                </div>
                <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.button
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-cyan-500/30 mt-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Salvar Alterações
          </motion.button>

          {/* Delete Account */}
          <motion.button
            className="w-full bg-red-500/20 border border-red-500/30 text-red-400 py-4 rounded-2xl font-bold mt-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Excluir Conta
          </motion.button>
        </div>
      </div>
    </div>
  );
}
