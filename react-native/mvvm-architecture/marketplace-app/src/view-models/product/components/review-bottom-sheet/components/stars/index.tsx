import { colors } from '@/styles/colors'
import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'

interface StarProps {
  rating: number
  onChangeRating: (rating: number) => void
}

export function Stars({ rating, onChangeRating }: StarProps) {
  return Array.from({ length: 5 }, (_, index) => {
    const starNumber = index + 1
    const isSelected = starNumber <= rating
    return (
      <TouchableOpacity
        key={`rating-star-${starNumber}`}
        onPress={() => onChangeRating(starNumber)}
      >
        <Ionicons
          name={isSelected ? 'star' : 'star-outline'}
          size={32}
          color={isSelected ? colors['purple-base'] : colors.grays[200]}
        />
      </TouchableOpacity>
    )
  })
}
