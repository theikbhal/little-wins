import AsyncStorage from '@react-native-async-storage/async-storage'

const KEYS = {
  WINS: '@little-wins/wins',
  FOCUS: '@little-wins/focus',
  NOTES: '@little-wins/notes',
  ONBOARDING_DONE: '@little-wins/onboarding',
  THEME: '@little-wins/theme',
}

export interface Win {
  id: string
  text: string
  createdAt: number
  celebrated: boolean
}

export interface Focus {
  id: string
  text: string
  createdAt: number
  completed: boolean
}

export interface ParNote {
  id: string
  text: string
  createdAt: number
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const storage = {
  // Wins
  async getWins(): Promise<Win[]> {
    const data = await AsyncStorage.getItem(KEYS.WINS)
    return data ? JSON.parse(data) : []
  },
  async addWin(text: string): Promise<Win[]> {
    const wins = await this.getWins()
    const win: Win = { id: generateId(), text, createdAt: Date.now(), celebrated: false }
    wins.unshift(win)
    await AsyncStorage.setItem(KEYS.WINS, JSON.stringify(wins))
    return wins
  },
  async celebrateWin(id: string): Promise<Win[]> {
    const wins = await this.getWins()
    const idx = wins.findIndex((w) => w.id === id)
    if (idx !== -1) {
      wins[idx].celebrated = !wins[idx].celebrated
    }
    await AsyncStorage.setItem(KEYS.WINS, JSON.stringify(wins))
    return wins
  },
  async deleteWin(id: string): Promise<Win[]> {
    const wins = await this.getWins()
    const filtered = wins.filter((w) => w.id !== id)
    await AsyncStorage.setItem(KEYS.WINS, JSON.stringify(filtered))
    return filtered
  },
  async clearWins(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.WINS)
  },

  // Focus
  async getFocus(): Promise<Focus | null> {
    const data = await AsyncStorage.getItem(KEYS.FOCUS)
    return data ? JSON.parse(data) : null
  },
  async setFocus(text: string): Promise<Focus> {
    const focus: Focus = { id: generateId(), text, createdAt: Date.now(), completed: false }
    await AsyncStorage.setItem(KEYS.FOCUS, JSON.stringify(focus))
    return focus
  },
  async completeFocus(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.FOCUS)
  },
  async clearFocus(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.FOCUS)
  },

  // ParNotes
  async getNotes(): Promise<ParNote[]> {
    const data = await AsyncStorage.getItem(KEYS.NOTES)
    return data ? JSON.parse(data) : []
  },
  async addNote(text: string): Promise<ParNote[]> {
    const notes = await this.getNotes()
    const note: ParNote = { id: generateId(), text, createdAt: Date.now() }
    notes.unshift(note)
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notes))
    return notes
  },
  async deleteNote(id: string): Promise<ParNote[]> {
    const notes = await this.getNotes()
    const filtered = notes.filter((n) => n.id !== id)
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(filtered))
    return filtered
  },

  // Onboarding
  async isOnboardingDone(): Promise<boolean> {
    const val = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE)
    return val === 'true'
  },
  async setOnboardingDone(): Promise<void> {
    await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, 'true')
  },
  async resetOnboarding(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.ONBOARDING_DONE)
  },
}
