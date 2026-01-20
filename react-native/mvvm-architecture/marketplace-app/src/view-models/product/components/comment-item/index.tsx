import type { ProductComment } from '@/shared/interfaces/product-comment'
import { useUserStore } from '@/shared/store/user-store'
import { colors } from '@/styles/colors'
import { Ionicons } from '@expo/vector-icons'
import { Image, Text, View } from 'react-native'

interface CommentItemProps {
  comment: ProductComment
}

export function CommentItem({ comment }: CommentItemProps) {
  const { user } = useUserStore()

  const isCurrentUser = user?.id === comment.user.id

  return (
    <View className="mb-3 rounded-lg bg-white p-4 shadow-sm">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <View className="mr-3 size-8 overflow-hidden rounded-[6px] bg-gray-200">
            {comment.user.avatar.url && comment.user.avatar.url !== '' ? (
              <Image
                className="h-full w-full"
                resizeMode="cover"
                source={{ uri: comment.user.avatar.url }}
              />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Ionicons name="person" size={20} color={colors.grays[400]} />
              </View>
            )}
          </View>

          <View className="flex-1 flex-row items-center">
            <Text className="text-base font-medium text-gray-800">
              {comment.user.name}
            </Text>
            {isCurrentUser && (
              <View className="ml-2 rounded-full bg-blue-base px-2 py-1">
                <Text className="text-xs font-bold uppercase text-white">
                  Você
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row items-end gap-1">
          <Ionicons name="star" size={16} color={colors['blue-base']} />
          <Text className="text-sm font-bold text-gray-600">
            {comment.user.rating.value} /{' '}
            <Text className="text-[10px] text-gray-600">5</Text>
          </Text>
        </View>
      </View>
      <Text>{comment.content}</Text>
    </View>
  )
}
