import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, Alert, StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { storage, ParNote } from '../storage'
import EmptyState from '../components/EmptyState'

export default function ParNoteScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [notes, setNotes] = useState<ParNote[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    storage.getNotes().then(setNotes)
  }, [])

  const addNote = useCallback(async () => {
    const text = input.trim()
    if (!text) return
    const updated = await storage.addNote(text)
    setNotes(updated)
    setInput('')
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [input])

  const deleteNote = useCallback((id: string) => {
    Alert.alert('Delete Note', 'Remove this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const updated = await storage.deleteNote(id)
          setNotes(updated)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
      },
    ])
  }, [])

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.title, { color: colors.text }]}>ParNotes</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Capture thoughts for later</Text>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onLongPress={() => deleteNote(item.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.noteText, { color: colors.text }]}>{item.text}</Text>
            <Text style={[styles.noteDate, { color: colors.textMuted }]}>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={[styles.list, notes.length === 0 && styles.listEmpty]}
        ListEmptyComponent={
          <EmptyState
            icon="📝"
            title="No notes yet"
            subtitle="Quick-capture ideas, reminders, or anything you don't want to forget."
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
          placeholder="Quick note..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addNote}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.note }]}
          onPress={addNote}
          activeOpacity={0.7}
          disabled={!input.trim()}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
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
  subtitle: {
    fontSize: 14,
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
  noteCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'System',
  },
  noteDate: {
    fontSize: 11,
    marginTop: 6,
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
    color: '#000',
    fontWeight: '300',
    marginTop: -2,
  },
})
