import { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Dimensions } from 'react-native'
import { useTheme } from '../theme/ThemeContext'

const { width, height } = Dimensions.get('window')

const EMOJIS = ['🎉', '✨', '⭐', '🌟', '💫', '🎊', '🏆', '👏', '🔥', '💪']
const PARTICLE_COUNT = 30

interface Particle {
  emoji: string
  x: number
  y: number
  animX: Animated.Value
  animY: Animated.Value
  opacity: Animated.Value
  scale: Animated.Value
  rotation: Animated.Value
}

export default function CelebrateAnimation({ visible, onFinish }: { visible: boolean; onFinish: () => void }) {
  const { colors, isDark } = useTheme()
  const particles = useRef<Particle[]>([])

  useEffect(() => {
    if (!visible) return

    particles.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      emoji: EMOJIS[i % EMOJIS.length],
      x: width / 2,
      y: height / 2,
      animX: new Animated.Value(0),
      animY: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(0),
      rotation: new Animated.Value(0),
    }))

    const animations = particles.current.map((p, i) => {
      const angle = (i / PARTICLE_COUNT) * 360
      const distance = 100 + Math.random() * 200
      const rad = (angle * Math.PI) / 180
      const tx = Math.cos(rad) * distance
      const ty = Math.sin(rad) * distance - 200

      return Animated.parallel([
        Animated.timing(p.animX, {
          toValue: tx,
          duration: 800 + Math.random() * 400,
          useNativeDriver: true,
        }),
        Animated.timing(p.animY, {
          toValue: ty,
          duration: 800 + Math.random() * 400,
          useNativeDriver: true,
        }),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(p.scale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotation, {
          toValue: 360 + Math.random() * 360,
          duration: 1000 + Math.random() * 500,
          useNativeDriver: true,
        }),
      ])
    })

    Animated.parallel(animations).start(() => {
      onFinish()
    })

    return () => {
      particles.current = []
    }
  }, [visible])

  if (!visible) return null

  return (
    <View style={[styles.container, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]} pointerEvents="none">
      {particles.current.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: p.animX },
                { translateY: p.animY },
                { scale: p.scale },
                { rotate: p.rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
              ],
              opacity: p.opacity,
            },
          ]}
        >
          <Animated.Text style={styles.emoji}>{p.emoji}</Animated.Text>
        </Animated.View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
    left: width / 2 - 15,
    top: height / 2 - 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
})
