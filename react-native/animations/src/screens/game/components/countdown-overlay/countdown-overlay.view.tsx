import { AppText } from '@/components/app-text'
import { StyleSheet, View } from 'react-native'
import type { useCountdownOverlayViewModel } from './use-countdown-overlay.view-model'

export function CountdownOverlayView({
  visible,
  count,
}: ReturnType<typeof useCountdownOverlayViewModel>) {
  if (!visible) return

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <AppText style={styles.countText}>{count}</AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 72,
    fontFamily: 'Baloo2_800ExtraBold',
  },
})
