import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, TouchableOpacity } from 'react-native'
import { colors } from '../../../../../../styles/colors'
import { useFavoriteButtonViewModel } from './favorite-button.view-model'

export function FavoriteButtonView({
  isFavorite,
  handleToggleFavorite,
  loading,
}: ReturnType<typeof useFavoriteButtonViewModel>) {
  if (loading) {
    return <ActivityIndicator size={29} color={colors['purple-base']} />
  }

  return (
    <TouchableOpacity onPress={handleToggleFavorite}>
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={28}
        color={colors['danger']}
      />
    </TouchableOpacity>
  )
}
