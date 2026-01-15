import { Image, Text, View } from 'react-native'

interface AuthFormHeaderProps {
  title: string
  subTitle: string
}

export function AuthFormHeader({ title, subTitle }: AuthFormHeaderProps) {
  return (
    <View className="mb-8 items-center">
      <Image
        source={require('../../../assets/images/Logo.png')}
        resizeMode="contain"
        className="mb-8 h-[60px] w-[80px]"
      />

      <Text className="mb-3 text-3xl font-bold text-gray-500">{title}</Text>
      <Text className="text-center text-base text-gray-300">{subTitle}</Text>
    </View>
  )
}
