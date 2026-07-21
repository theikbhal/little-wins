import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { useTheme } from '../theme/ThemeContext'

const { width } = Dimensions.get('window')

const slides = [
  {
    icon: '🎉',
    title: 'Welcome to Little Wins',
    subtitle: 'A tiny app for ADHD brains.\nCelebrate the small stuff.',
  },
  {
    icon: '✅',
    title: 'Log Your Wins',
    subtitle: 'Finished a task? Brushed your teeth?\nSent that email? Log it. Tap to celebrate.',
  },
  {
    icon: '🎯',
    title: 'One Focus at a Time',
    subtitle: 'Set just ONE focus item.\nNo lists. No overwhelm. Just now.',
  },
  {
    icon: '📝',
    title: 'Notes for Later',
    subtitle: 'Quick-capture thoughts without\nlosing your focus.',
  },
  {
    icon: '🔒',
    title: '100% Private',
    subtitle: 'Everything stays on your device.\nNo accounts. No cloud. No tracking.',
  },
]

interface Props {
  onDone: () => void
}

export default function Onboarding({ onDone }: Props) {
  const { colors, isDark } = useTheme()
  const [step, setStep] = useState(0)

  const slide = slides[step]
  const isLast = step === slides.length - 1

  function handleNext() {
    if (isLast) {
      onDone()
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.top}>
        {!isLast && (
          <TouchableOpacity onPress={onDone} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.icon}>{slide.icon}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{slide.subtitle}</Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === step ? colors.accent : colors.border,
                  width: i === step ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: '#000' }]}>
            {isLast ? 'Start' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    height: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  skipBtn: {
    padding: 8,
  },
  skipText: {
    fontSize: 15,
    fontFamily: 'System',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 26,
  },
  bottom: {
    paddingHorizontal: 32,
    paddingBottom: 50,
    gap: 32,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
})
