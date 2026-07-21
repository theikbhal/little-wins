import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { useRef } from 'react'
import { useTheme } from '../theme/ThemeContext'
import { Win } from '../storage'

interface Props {
  win: Win
  onCelebrate: (win: Win) => void
  onDelete: (id: string) => void
}

export default function WinCard({ win, onCelebrate, onDelete }: Props) {
  const { colors } = useTheme()
  const scaleAnim = useRef(new Animated.Value(1)).current

  function handlePress() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start()
    onCelebrate(win)
  }

  const dateStr = new Date(win.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        onLongPress={() => onDelete(win.id)}
        style={[styles.card, {
          backgroundColor: colors.surface,
          borderColor: win.celebrated ? colors.winGlow : colors.border,
        }]}
      >
        <View style={styles.left}>
          <Text style={[styles.celebrateIcon, win.celebrated && styles.celebratedIcon]}>
            {win.celebrated ? '🎉' : '⬜'}
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.text, { color: colors.text }, win.celebrated && styles.celebratedText]}>
            {win.text}
          </Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>{dateStr}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(win.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.deleteIcon, { color: colors.textMuted }]}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  left: {
    marginRight: 12,
  },
  celebrateIcon: {
    fontSize: 20,
    opacity: 0.4,
  },
  celebratedIcon: {
    opacity: 1,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'System',
    fontWeight: '500',
  },
  celebratedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  date: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'System',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 14,
    fontWeight: '600',
  },
})
