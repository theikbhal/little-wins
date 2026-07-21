import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, Alert, StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { storage, Win } from '../storage'
import WinCard from '../components/WinCard'
import EmptyState from '../components/EmptyState'
import CelebrateAnimation from '../components/CelebrateAnimation'

export default function WinsScreen() {
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const [wins, setWins] = useState<Win[]>([])
  const [input, setInput] = useState('')
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebratedWin, setCelebratedWin] = useState<Win | null>(null)

  useEffect(() => {
    storage.getWins().then(setWins)
  }, [])

  const addWin = useCallback(async () => {
    const text = input.trim()
    if (!text) return
    const updated = await storage.addWin(text)
    setWins(updated)
    setInput('')
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }, [input])

  const celebrateWin = useCallback(async (win: Win) => {
    const updated = await storage.celebrateWin(win.id)
    setWins(updated)
    setCelebratedWin(win)
    setShowCelebration(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }, [])

  const deleteWin = useCallback((id: string) => {
    Alert.alert('Delete Win', 'Remove this win forever?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const updated = await storage.deleteWin(id)
          setWins(updated)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
      },
    ])
  }, [])

  const todaysCount = wins.filter(
    (w) => new Date(w.createdAt).toDateString() === new Date().toDateString()
  ).length

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Little Wins</Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {wins.length > 0 ? `${todaysCount} today · ${wins.length} total` : ''}
        </Text>
      </View>

      <FlatList
        data={wins}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WinCard win={item} onCelebrate={celebrateWin} onDelete={deleteWin} />
        )}
        contentContainerStyle={[styles.list, wins.length === 0 && styles.listEmpty]}
        ListEmptyComponent={
          <EmptyState
            icon="🎉"
            title="No wins yet"
            subtitle="Tap below to log your first little win. Big things start small."
          />
        }
      />

      <View style={[styles.inputBar, {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom + 8,
      }]}>
        <TextInput
          style={[styles.input, {
            backgroundColor: colors.surfaceAlt,
            color: colors.text,
          }]}
          placeholder="What's your win?"
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addWin}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.accent }]}
          onPress={addWin}
          activeOpacity={0.7}
          disabled={!input.trim()}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <CelebrateAnimation
        visible={showCelebration}
        onFinish={() => setShowCelebration(false)}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'System',
    letterSpacing: -0.5,
  },
  count: {
    fontSize: 13,
    fontFamily: 'System',
    marginTop: 2,
  },
  list: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  listEmpty: {
    flexGrow: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 18,
    fontSize: 15,
    fontFamily: 'System',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 24,
    color: '#000',
    fontWeight: '300',
    marginTop: -2,
  },
})
