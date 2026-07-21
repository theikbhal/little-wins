import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { storage, Focus } from '../storage'
import EmptyState from '../components/EmptyState'

export default function FocusScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [focus, setFocus] = useState<Focus | null>(null)
  const [input, setInput] = useState('')

  useEffect(() => {
    storage.getFocus().then(setFocus)
  }, [])

  const setNewFocus = useCallback(async () => {
    const text = input.trim()
    if (!text) return
    const f = await storage.setFocus(text)
    setFocus(f)
    setInput('')
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }, [input])

  const completeFocus = useCallback(async () => {
    if (!focus) return
    await storage.completeFocus()
    setFocus(null)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }, [focus])

  if (!focus) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={[styles.title, { color: colors.text }]}>Focus</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>One thing at a time</Text>
        </View>

        <EmptyState
          icon="🎯"
          title="What matters now?"
          subtitle="Set just ONE focus item. When it's done, clear it and move on."
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
            placeholder="What's your one focus?"
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={setNewFocus}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.focus }]}
            onPress={setNewFocus}
            activeOpacity={0.7}
            disabled={!input.trim()}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Focus</Text>
      </View>

      <View style={styles.focusContainer}>
        <View style={[styles.focusCard, {
          backgroundColor: colors.surface,
          borderColor: colors.focus + '40',
        }]}>
          <Text style={[styles.focusIcon]}>🎯</Text>
          <Text style={[styles.focusText, { color: colors.text }]}>{focus.text}</Text>
          <Text style={[styles.focusDate, { color: colors.textMuted }]}>
            Started {new Date(focus.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.completeBtn, { backgroundColor: colors.accent }]}
          onPress={completeFocus}
          activeOpacity={0.8}
        >
          <Text style={styles.completeBtnText}>Complete ✓</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  subtitle: {
    fontSize: 14,
    fontFamily: 'System',
    marginTop: 2,
  },
  focusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  focusCard: {
    width: '100%',
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  focusIcon: {
    fontSize: 40,
  },
  focusText: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 30,
  },
  focusDate: {
    fontSize: 12,
    fontFamily: 'System',
    marginTop: 4,
  },
  completeBtn: {
    marginTop: 32,
    paddingHorizontal: 48,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'System',
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
    color: '#FFF',
    fontWeight: '300',
    marginTop: -2,
  },
})
