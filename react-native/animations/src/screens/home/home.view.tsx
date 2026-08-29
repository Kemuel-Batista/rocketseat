import { AppText } from '@/components/app-text'
import { colors } from '@/constants/colors'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export function HomeView() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText>Home</AppText>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale.gray700,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
})
