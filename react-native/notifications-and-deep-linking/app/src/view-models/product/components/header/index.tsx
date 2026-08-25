import { AppPriceText } from '@/shared/components/app-price-text'
import { buildImageUrl } from '@/shared/helpers/build-image-url'
import type { GetProductDetailInterface } from '@/shared/interfaces/http/product-detail'
import { colors } from '@/styles/colors'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { FavoriteButton } from './components/favorite-button'

interface ProductHeaderProps {
  productDetails: GetProductDetailInterface
  handleOpenReview: () => void
}

export function ProductHeader({
  productDetails,
  handleOpenReview,
}: ProductHeaderProps) {
  return (
    <>
      <View className="flex-row items-start justify-between pb-5">
        <TouchableOpacity
          onPress={router.back}
          className="flex-row items-center justify-start gap-3"
        >
          <Ionicons name="arrow-back" size={24} color={colors['purple-base']} />
          <Text className="text-base text-purple-base">Voltar</Text>
        </TouchableOpacity>
        <FavoriteButton productId={productDetails.id} />
      </View>

      <View className="w-full rounded-lg bg-white shadow-xl shadow-gray-500/30">
        <Image
          source={{ uri: buildImageUrl(productDetails.photo) }}
          className="h-[192px] w-full rounded-lg"
        />

        <View className="absolute right-0 top-0 flex-row items-center rounded-bl-lg rounded-tr-lg bg-blue-light px-2 py-2">
          <Ionicons name="star" size={16} color={colors['blue-base']} />
          <Text className="ml-1 text-sm font-semibold text-gray-800">
            {productDetails.averageRating.toFixed(1)}
          </Text>
          <Text className="ml-1 text-[10px] font-semibold text-gray-800">
            / 5
          </Text>
        </View>
      </View>

      <View className="py-8">
        <View className="mb-4 flex-row items-baseline justify-between">
          <Text className="max-w-[70%] text-xl font-bold text-gray-800">
            {productDetails.name}
          </Text>
          <View>
            <AppPriceText
              value={Number(productDetails.value)}
              classNameValue="text-xl font-bold text-gray-800 ml-1"
            />
          </View>
        </View>

        <View className="mb-4 flex-row items-center rounded-lg bg-blue-light p-3">
          <View className="size-[36px] items-center justify-center rounded-[6px] bg-blue-base">
            <Ionicons name="trending-up" size={20} color={colors.white} />
          </View>
          <Text className="ml-5 flex-1 text-sm text-gray-600">
            <Text className="font-bold">{productDetails.views} pessoas </Text>
            visualizaram este produto nos últimos 7 dias
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-base leading-6 text-gray-500">
            {productDetails.description}
          </Text>
        </View>

        {(productDetails.width || productDetails.height) && (
          <View className="mb-4">
            {productDetails.width && (
              <Text className="mb-1 text-base text-gray-500">
                <Text className="text-gray-800">Largura:</Text>{' '}
                {productDetails.width}
              </Text>
            )}
            {productDetails.height && (
              <Text className="mb-1 text-base text-gray-500">
                <Text className="text-gray-800">Altura:</Text>{' '}
                {productDetails.height}
              </Text>
            )}
          </View>
        )}

        <View className="mb-6">
          <Text className="text-base font-bold text-gray-800">Categoria</Text>
          <Text className="text-base text-gray-600">
            {productDetails.category.name}
          </Text>
        </View>

        <View className="flex-row items-center justify-between border-t border-gray-200 pt-4">
          <Text className="text-base font-bold text-gray-800">Avaliações</Text>

          <TouchableOpacity onPress={handleOpenReview}>
            <Text className="text-base font-medium text-purple-base">
              Avaliar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}
