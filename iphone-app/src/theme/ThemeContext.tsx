import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { dark, light, ThemeColors } from './colors'

type ThemeMode = 'dark' | 'light' | 'system'

interface ThemeContextType {
  colors: ThemeColors
  mode: ThemeMode
  isDark: boolean
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType>({
  colors: dark,
  mode: 'dark',
  isDark: true,
  setMode: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>('dark')

  useEffect(() => {
    AsyncStorage.getItem('theme-mode').then((saved) => {
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        setModeState(saved)
      }
    })
  }, [])

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
    AsyncStorage.setItem('theme-mode', m)
  }, [])

  const effectiveDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark'
  const colors = effectiveDark ? dark : light

  return (
    <ThemeContext.Provider value={{ colors, mode, isDark: effectiveDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
