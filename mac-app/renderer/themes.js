const Theme = {
  current: 'dark',

  async init() {
    this.current = Store.getSetting('theme') || 'dark'
    this.apply(this.current)
    window.electronAPI.onSystemThemeChanged((isDark) => {
      if (this.current === 'system') {
        this.applyTheme(isDark ? 'dark' : 'light')
      }
    })
  },

  apply(mode) {
    this.current = mode
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      this.applyTheme(prefersDark ? 'dark' : 'light')
    } else {
      this.applyTheme(mode)
    }
    this.updateToggleIcon()
  },

  applyTheme(theme) {
    document.documentElement.dataset.theme = theme
  },

  cycle() {
    const modes = ['dark', 'light', 'system']
    const idx = modes.indexOf(this.current)
    const next = modes[(idx + 1) % modes.length]
    this.apply(next)
    Store.setSetting('theme', next)
  },

  updateToggleIcon() {
    const btn = document.getElementById('theme-toggle')
    if (btn) {
      const icons = { dark: '🌙', light: '☀️', system: '💻' }
      btn.textContent = icons[this.current] || '🌙'
    }
  },
}
