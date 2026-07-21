import { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider, useTheme } from './src/theme/ThemeContext'
import { storage } from './src/storage'
import Onboarding from './src/components/Onboarding'
import WinsScreen from './src/screens/WinsScreen'
import FocusScreen from './src/screens/FocusScreen'
import ParNoteScreen from './src/screens/ParNoteScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import { Text, View, StyleSheet } from 'react-native'

const Tab = createBottomTabNavigator()

const TAB_ICONS: Record<string, [string, string]> = {
  Wins: ['🎉', '🎊'],
  Focus: ['🎯', '✅'],
  ParNote: ['📝', '📋'],
  Settings: ['⚙️', '⚙️'],
}

function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  const icons = TAB_ICONS[routeName] || ['●', '○']
  return <Text style={{ fontSize: 20 }}>{focused ? icons[0] : icons[1]}</Text>
}

function AppContent() {
  const { colors, isDark } = useTheme()
  const [onboarding, setOnboarding] = useState<boolean | null>(null)

  useEffect(() => {
    storage.isOnboardingDone().then(setOnboarding)
  }, [])

  if (onboarding === null) return null

  if (!onboarding) {
    return (
      <Onboarding
        onDone={async () => {
          await storage.setOnboardingDone()
          setOnboarding(true)
        }}
      />
    )
  }

  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: '#000000', card: '#111111', border: '#222222', primary: '#00FF87' } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#FFFFFF', card: '#F5F5F5', border: '#E0E0E0', primary: '#00CC6A' } }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />,
          tabBarLabel: () => null,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 60,
            paddingTop: 8,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
        })}
      >
        <Tab.Screen name="Wins" component={WinsScreen} />
        <Tab.Screen name="Focus" component={FocusScreen} />
        <Tab.Screen name="ParNote" component={ParNoteScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
