import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../theme/ThemeContext'

interface Props {
  icon: string
  title: string
  subtitle: string
}

export default function EmptyState({ icon, title, subtitle }: Props) {
  const { colors } = useTheme()

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'System',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 22,
  },
})
