import { AppText } from '@/components/app-text'
import { colors } from '@/constants/colors'
import { StyleSheet, View } from 'react-native'

interface StatCardParams {
  icon: React.ReactNode
  value: string | null
  label: string
  variant?: 'purple' | 'cyan'
}

export function StatsCardView({
  icon,
  value,
  label,
  variant = 'purple',
}: StatCardParams) {
  const valueColor =
    variant === 'purple' ? colors.accent.lightPurple : colors.accent.cyan
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <AppText style={[styles.value, { color: valueColor }]}>{value}</AppText>
        {icon}
      </View>
      <AppText style={styles.label}>{label}</AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderColor: colors.grayscale.gray400,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  value: {
    fontSize: 28,
    fontFamily: 'Baloo2_800ExtraBold',
  },
  label: {
    fontSize: 14,
    color: colors.grayscale.gray200,
  },
})
