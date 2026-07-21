import { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet,
  Linking,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '../theme/ThemeContext'
import { storage } from '../storage'
import { helpContent, shortcuts } from '../constants/help'

export default function SettingsScreen() {
  const { colors, mode, setMode, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const [winCount, setWinCount] = useState(0)
  const [noteCount, setNoteCount] = useState(0)

  useEffect(() => {
    Promise.all([storage.getWins(), storage.getNotes()]).then(([wins, notes]) => {
      setWinCount(wins.length)
      setNoteCount(notes.length)
    })
  }, [])

  function clearAllData() {
    Alert.alert(
      'Clear All Data',
      'This will delete all wins, focus, and notes. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            await storage.clearWins()
            await storage.clearFocus()
            await AsyncStorage.clear()
            setWinCount(0)
            setNoteCount(0)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          },
        },
      ],
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Stats */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Stats</Text>
          <View style={[styles.statRow, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Wins</Text>
            <Text style={[styles.statValue, { color: colors.accent }]}>{winCount}</Text>
          </View>
          <View style={[styles.statRow, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Notes Saved</Text>
            <Text style={[styles.statValue, { color: colors.note }]}>{noteCount}</Text>
          </View>
        </View>

        {/* Theme */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Theme</Text>
          {(['dark', 'light', 'system'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.optionRow, { backgroundColor: colors.surface }]}
              onPress={() => { setMode(t); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
            >
              <Text style={[styles.optionDot, { color: mode === t ? colors.accent : colors.textMuted }]}>
                {mode === t ? '●' : '○'}
              </Text>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Help */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>How it works</Text>
          {helpContent.map((item, i) => (
            <View key={i} style={[styles.helpCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.helpIcon}>{item.icon}</Text>
              <View style={styles.helpContent}>
                <Text style={[styles.helpTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>{item.text}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Shortcuts */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Shortcuts</Text>
          {shortcuts.map((s, i) => (
            <View key={i} style={[styles.shortcutRow, { backgroundColor: colors.surface }]}>
              <Text style={[styles.shortcutKey, { color: colors.text, backgroundColor: colors.surfaceAlt }]}>
                {s.key}
              </Text>
              <Text style={[styles.shortcutAction, { color: colors.textSecondary }]}>{s.action}</Text>
            </View>
          ))}
        </View>

        {/* Danger */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.dangerBtn, { backgroundColor: colors.danger + '15' }]}
            onPress={clearAllData}
          >
            <Text style={[styles.dangerText, { color: colors.danger }]}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Little Wins v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Made for ADHD brains 💪
          </Text>
        </View>
      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 0.5,
  },
  statLabel: {
    fontSize: 15,
    fontFamily: 'System',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'System',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 0.5,
    gap: 10,
  },
  optionDot: {
    fontSize: 16,
  },
  optionLabel: {
    fontSize: 15,
    fontFamily: 'System',
  },
  helpCard: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 0.5,
    gap: 12,
  },
  helpIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  helpContent: {
    flex: 1,
    gap: 4,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
  },
  helpText: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'System',
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    gap: 12,
  },
  shortcutKey: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  shortcutAction: {
    fontSize: 14,
    fontFamily: 'System',
  },
  dangerBtn: {
    padding: 16,
    alignItems: 'center',
  },
  dangerText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'System',
  },
})
