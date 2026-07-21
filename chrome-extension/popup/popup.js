// === Storage ===
const Store = {
  async get() {
    const d = await chrome.storage.local.get(['wins', 'focus', 'settings', 'onboardingDone'])
    return {
      wins: d.wins || [],
      focus: d.focus || null,
      settings: d.settings || { theme: 'dark' },
      onboardingDone: d.onboardingDone === true,
    }
  },
  async save(data) {
    await chrome.storage.local.set(data)
  },
  async addWin(text) {
    const { wins = [] } = await chrome.storage.local.get('wins')
    const w = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, createdAt: Date.now(), celebrated: false }
    wins.unshift(w)
    await chrome.storage.local.set({ wins })
    return wins
  },
  async toggleCelebrate(id) {
    const { wins = [] } = await chrome.storage.local.get('wins')
    const w = wins.find(x => x.id === id)
    if (w) w.celebrated = !w.celebrated
    await chrome.storage.local.set({ wins })
    return wins
  },
  async deleteWin(id) {
    let { wins = [] } = await chrome.storage.local.get('wins')
    wins = wins.filter(x => x.id !== id)
    await chrome.storage.local.set({ wins })
    return wins
  },
  async setFocus(text) {
    const f = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, createdAt: Date.now() }
    await chrome.storage.local.set({ focus: f })
    return f
  },
  async clearFocus() {
    await chrome.storage.local.set({ focus: null })
  },
}

// === Confetti ===
const Confetti = {
  canvas: null, ctx: null, particles: [], frame: null,
  init() {
    this.canvas = document.getElementById('confetti-canvas')
    if (!this.canvas) return
    this.ctx = this.canvas.getContext('2d')
    this.resize()
  },
  resize() {
    if (!this.canvas) return
    this.canvas.width = 380; this.canvas.height = 480
  },
  burst(count = 35) {
    const colors = ['#00FF87','#FFD700','#FF6B6B','#64D8FF','#C084FC','#FF87C4']
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: 190, y: 240, vx: (Math.random() - 0.5) * 10, vy: -Math.random() * 12 - 3,
        size: 3 + Math.random() * 5, color: colors[Math.floor(Math.random() * colors.length)],
        life: 1, decay: 0.012 + Math.random() * 0.018, gravity: 0.2,
      })
    }
    if (!this.frame) this.animate()
  },
  animate() {
    if (!this.ctx) return
    this.ctx.clearRect(0, 0, 380, 480)
    this.particles = this.particles.filter(p => p.life > 0)
    for (const p of this.particles) {
      p.x += p.vx; p.vy += p.gravity; p.y += p.vy; p.life -= p.decay
      this.ctx.globalAlpha = Math.max(0, p.life)
      this.ctx.fillStyle = p.color
      this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); this.ctx.fill()
    }
    this.ctx.globalAlpha = 1
    if (this.particles.length > 0) this.frame = requestAnimationFrame(() => this.animate())
    else { this.frame = null; this.ctx.clearRect(0, 0, 380, 480) }
  },
}

// === Theme ===
const Theme = {
  current: 'dark',
  async init() {
    const { settings = { theme: 'dark' } } = await chrome.storage.local.get('settings')
    this.current = settings.theme || 'dark'
    this.apply(this.current)
  },
  apply(mode) {
    this.current = mode
    if (mode === 'system') {
      const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.dataset.theme = prefers ? 'dark' : 'light'
    } else {
      document.documentElement.dataset.theme = mode
    }
    this.updateBtn()
  },
  cycle() {
    const modes = ['dark', 'light', 'system']
    const i = (modes.indexOf(this.current) + 1) % modes.length
    this.apply(modes[i])
    chrome.storage.local.set({ settings: { theme: modes[i] } })
  },
  updateBtn() {
    const btn = document.getElementById('theme-btn')
    if (btn) btn.textContent = { dark: '🌙', light: '☀️', system: '💻' }[this.current] || '🌙'
  },
}

// === Wins Tab ===
const Wins = {
  page: 0, perPage: 8, container: null,
  async init() {
    this.container = document.getElementById('tab-wins')
    await this.render()
  },
  async render() {
    const { wins } = await chrome.storage.local.get('wins')
    const total = wins.length
    const totalPages = Math.max(1, Math.ceil(total / this.perPage))
    const start = this.page * this.perPage
    const items = wins.slice(start, start + this.perPage)

    this.container.innerHTML = `
      <div class="win-input-row">
        <input class="win-input" id="win-input" type="text" placeholder="Quick win..." />
        <button class="win-add-btn" id="win-add-btn">+</button>
      </div>
      <div class="win-list" id="win-list">
        ${items.length === 0
          ? '<div style="text-align:center;padding:40px 0;color:var(--text-muted);font-size:12px;">No wins yet.<br/>Log your first one above.</div>'
          : items.map(w => `
            <div class="win-item${w.celebrated ? ' celebrated' : ''}" data-id="${w.id}">
              <button class="win-celebrate-btn" data-id="${w.id}">${w.celebrated ? '✅' : '⬜'}</button>
              <span class="win-text">${this.esc(w.text)}</span>
              <span class="win-date">${new Date(w.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
              <button class="win-delete-btn" data-id="${w.id}">✕</button>
            </div>
          `).join('')
        }
      </div>
      ${totalPages > 1 ? `
        <div class="pagination">
          <button id="page-prev" ${this.page === 0 ? 'disabled' : ''}>← Prev</button>
          <span class="page-info">${this.page + 1}/${totalPages}</span>
          <button id="page-next" ${this.page >= totalPages - 1 ? 'disabled' : ''}>Next →</button>
        </div>
      ` : total > 0 ? `<div style="text-align:center;padding:6px;font-size:10px;color:var(--text-muted);">${total} win${total !== 1 ? 's' : ''}</div>` : ''}
    `

    this.bindEvents()
    document.getElementById('win-input')?.focus()
  },
  esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML },
  bindEvents() {
    const input = document.getElementById('win-input')
    const addBtn = document.getElementById('win-add-btn')
    const add = async () => {
      const t = input?.value.trim()
      if (!t) return
      await Store.addWin(t)
      this.page = 0
      await this.render()
      Confetti.burst()
    }
    addBtn?.addEventListener('click', add)
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') add() })

    document.getElementById('page-prev')?.addEventListener('click', async () => {
      if (this.page > 0) { this.page--; await this.render() }
    })
    document.getElementById('page-next')?.addEventListener('click', async () => {
      const { wins } = await chrome.storage.local.get('wins')
      if ((this.page + 1) * this.perPage < wins.length) { this.page++; await this.render() }
    })

    document.querySelectorAll('.win-celebrate-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        await Store.toggleCelebrate(e.currentTarget.dataset.id)
        Confetti.burst()
        await this.render()
      })
    })
    document.querySelectorAll('.win-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        await Store.deleteWin(e.currentTarget.dataset.id)
        const { wins } = await chrome.storage.local.get('wins')
        if (this.page > 0 && this.page * this.perPage >= wins.length) this.page--
        await this.render()
      })
    })
  },
}

// === Focus Tab ===
const FocusTab = {
  container: null,
  async init() {
    this.container = document.getElementById('tab-focus')
    await this.render()
  },
  async render() {
    const { focus } = await chrome.storage.local.get('focus')
    if (!focus) {
      this.container.innerHTML = `
        <div class="focus-empty">
          <div class="icon">🎯</div>
          <div class="title">What matters now?</div>
          <div class="subtitle">One focus at a time.</div>
          <div class="win-input-row" style="width:100%;">
            <input class="win-input" id="focus-input" type="text" placeholder="Your one focus..." />
            <button class="win-add-btn" id="focus-set-btn" style="background:var(--focus-color);color:#fff;">+</button>
          </div>
        </div>
      `
      const input = document.getElementById('focus-input')
      const btn = document.getElementById('focus-set-btn')
      const set = async () => {
        const t = input.value.trim()
        if (!t) return
        await Store.setFocus(t)
        await this.render()
      }
      btn?.addEventListener('click', set)
      input?.addEventListener('keydown', e => { if (e.key === 'Enter') set() })
      setTimeout(() => input?.focus(), 50)
    } else {
      this.container.innerHTML = `
        <div class="focus-active">
          <div class="focus-card">
            <div class="focus-text">${this.esc(focus.text)}</div>
            <div class="focus-date">Started ${new Date(focus.createdAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</div>
          </div>
          <button class="focus-complete-btn" id="focus-complete-btn">Complete ✓</button>
        </div>
      `
      document.getElementById('focus-complete-btn')?.addEventListener('click', async () => {
        await Store.clearFocus()
        Confetti.burst()
        await this.render()
      })
    }
  },
  esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML },
}

// === Zikir Tab ===
const Zikir = {
  count: 0, total: 100, preset: 100, running: false, interval: null, container: null,
  presets: [30, 100, 300, 1000],
  init() {
    this.container = document.getElementById('tab-zikir')
    this.preset = 100; this.reset(); this.render()
  },
  reset() { this.stop(); this.count = this.preset; this.total = this.preset; this.render() },
  start() {
    if (this.running) return
    if (this.count <= 0) this.reset()
    this.running = true; this.render()
    this.interval = setInterval(() => {
      if (this.count > 0) { this.count--; this.render(); if (this.count === 0) { this.stop(); Confetti.burst() } }
      else this.stop()
    }, 200)
  },
  stop() {
    this.running = false
    if (this.interval) { clearInterval(this.interval); this.interval = null }
    this.render()
  },
  setPreset(val) { if (!this.running) { this.preset = val; this.reset() } },
  render() {
    const pct = this.total > 0 ? ((this.total - this.count) / this.total) * 100 : 0
    this.container.innerHTML = `
      <div class="zikir-container">
        <div class="zikir-label">Count</div>
        <div class="zikir-count">${this.count}</div>
        <div class="zikir-progress"><div class="zikir-progress-bar" style="width:${pct}%"></div></div>
        <div class="zikir-presets">${this.presets.map(p => `<button class="zikir-preset-btn${p === this.preset ? ' active' : ''}" data-preset="${p}">${p}</button>`).join('')}</div>
        <div class="zikir-controls">
          <button class="zikir-btn start" id="zikir-start-btn" ${this.count <= 0 && !this.running ? 'disabled' : ''}>${this.running ? '⏸ Pause' : this.count < this.total ? '▶ Continue' : '▶ Start'}</button>
          <button class="zikir-btn reset" id="zikir-reset-btn">↺ Reset</button>
        </div>
      </div>
    `
    document.getElementById('zikir-start-btn')?.addEventListener('click', () => { if (this.running) this.stop(); else this.start() })
    document.getElementById('zikir-reset-btn')?.addEventListener('click', () => this.reset())
    document.querySelectorAll('.zikir-preset-btn').forEach(b => b.addEventListener('click', () => this.setPreset(parseInt(b.dataset.preset))))
  },
}

// === Onboarding ===
function showOnboarding() {
  const slides = [
    { icon: '🎉', title: 'Welcome to Little Wins', text: 'A tiny extension for ADHD brains. Celebrate the small stuff.' },
    { icon: '✅', title: 'Log Your Wins', text: 'Finished something small? Log it. Tap to celebrate with confetti.' },
    { icon: '🎯', title: 'One Focus', text: 'Set just ONE focus item. No lists. No overwhelm. Just now.' },
    { icon: '📿', title: 'Zikir Counter', text: 'Reverse countdown with presets (30, 100, 300, 1000) for dhikr or breathing.' },
    { icon: '🔒', title: '100% Private', text: 'Everything stays in your browser. No cloud. No tracking.' },
  ]
  let step = 0

  function render() {
    const s = slides[step]
    document.body.innerHTML = `
      <div class="ob-overlay" style="font-family:var(--font);">
        <div class="ob-slide">
          <div class="ob-icon">${s.icon}</div>
          <div class="ob-title">${s.title}</div>
          <div class="ob-text">${s.text}</div>
        </div>
        <div class="ob-dots">${slides.map((_, i) => `<div class="ob-dot${i === step ? ' active' : ''}"></div>`).join('')}</div>
        <button class="ob-btn" id="ob-next">${step === slides.length - 1 ? 'Start' : 'Next'}</button>
        ${step < slides.length - 1 ? '<button class="ob-skip" id="ob-skip">Skip</button>' : ''}
      </div>
    `

    document.getElementById('ob-next')?.addEventListener('click', async () => {
      if (step >= slides.length - 1) {
        await chrome.storage.local.set({ onboardingDone: true })
        location.reload()
      } else { step++; render() }
    })
    document.getElementById('ob-skip')?.addEventListener('click', async () => {
      await chrome.storage.local.set({ onboardingDone: true })
      location.reload()
    })
  }
  render()
}

// === App Init ===
document.addEventListener('DOMContentLoaded', async () => {
  Confetti.init()
  await Theme.init()

  const { onboardingDone } = await chrome.storage.local.get('onboardingDone')
  if (!onboardingDone) { showOnboarding(); return }


  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))
      btn.classList.add('active')
      document.getElementById(`tab-${btn.dataset.tab}`)?.classList.add('active')
      if (btn.dataset.tab === 'wins') Wins.render()
      else if (btn.dataset.tab === 'focus') FocusTab.render()
    })
  })

  document.getElementById('theme-btn')?.addEventListener('click', () => Theme.cycle())

  await Wins.init()
  await FocusTab.init()
  Zikir.init()
})
