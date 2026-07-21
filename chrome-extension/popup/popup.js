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
  async save(data) { await chrome.storage.local.set(data) },
  async addWin(text) {
    const { wins = [] } = await chrome.storage.local.get('wins')
    wins.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, createdAt: Date.now(), celebrated: false })
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
  async clearFocus() { await chrome.storage.local.set({ focus: null }) },
}

// === Confetti ===
const Confetti = {
  canvas: null, ctx: null, particles: [], frame: null,
  init() {
    this.canvas = document.getElementById('confetti-canvas')
    if (!this.canvas) return
    this.ctx = this.canvas.getContext('2d')
    this.canvas.width = 380; this.canvas.height = 480
  },
  burst(count = 35) {
    const colors = ['#00FF87','#FFD700','#FF6B6B','#64D8FF','#C084FC','#FF87C4']
    for (let i = 0; i < count; i++)
      this.particles.push({ x: 190, y: 240, vx: (Math.random() - 0.5) * 10, vy: -Math.random() * 12 - 3, size: 3 + Math.random() * 5, color: colors[Math.floor(Math.random() * colors.length)], life: 1, decay: 0.012 + Math.random() * 0.018, gravity: 0.2 })
    if (!this.frame) this.animate()
  },
  animate() {
    if (!this.ctx) return
    this.ctx.clearRect(0, 0, 380, 480)
    this.particles = this.particles.filter(p => p.life > 0)
    for (const p of this.particles) { p.x += p.vx; p.vy += p.gravity; p.y += p.vy; p.life -= p.decay; this.ctx.globalAlpha = Math.max(0, p.life); this.ctx.fillStyle = p.color; this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); this.ctx.fill() }
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
    document.documentElement.dataset.theme = mode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode
    const btn = document.getElementById('theme-btn')
    if (btn) btn.textContent = { dark: '🌙', light: '☀️', system: '💻' }[this.current] || '🌙'
  },
  cycle() {
    const modes = ['dark', 'light', 'system']
    const i = (modes.indexOf(this.current) + 1) % modes.length
    this.apply(modes[i])
    chrome.storage.local.set({ settings: { theme: modes[i] } })
  },
}

// === Wins Tab ===
let winsPage = 0
const winsPerPage = 8

async function renderWins() {
  const el = document.getElementById('tab-wins')
  if (!el) return
  const { wins = [] } = await chrome.storage.local.get('wins')
  const totalPages = Math.max(1, Math.ceil(wins.length / winsPerPage))
  const start = winsPage * winsPerPage
  const items = wins.slice(start, start + winsPerPage)

  el.innerHTML = `
    <div class="win-input-row">
      <input class="win-input" id="wi" type="text" placeholder="Quick win..." autofocus />
      <button class="win-add-btn" id="wa">+</button>
    </div>
    <div class="win-list">
      ${items.length === 0
        ? '<div style="text-align:center;padding:40px 0;color:var(--text-muted);font-size:12px;">No wins yet.<br/>Log your first one above.</div>'
        : items.map(w => `
          <div class="win-item${w.celebrated ? ' celebrated' : ''}" data-id="${w.id}">
            <button class="wc" data-id="${w.id}">${w.celebrated ? '✅' : '⬜'}</button>
            <span class="win-text">${escHtml(w.text)}</span>
            <span class="win-date">${new Date(w.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
            <button class="wd" data-id="${w.id}">✕</button>
          </div>
        `).join('')
      }
    </div>
    ${totalPages > 1 ? `
      <div class="pagination">
        <button id="wp" data-dir="prev" ${winsPage === 0 ? 'disabled' : ''}>← Prev</button>
        <span class="page-info">${winsPage + 1}/${totalPages}</span>
        <button id="wn" data-dir="next" ${winsPage >= totalPages - 1 ? 'disabled' : ''}>Next →</button>
      </div>
    ` : wins.length > 0 ? `<div style="text-align:center;padding:4px;font-size:10px;color:var(--text-muted);">${wins.length} win${wins.length !== 1 ? 's' : ''}</div>` : ''}
  `

  // Bind events (direct, no closures over stale refs)
  document.getElementById('wa')?.addEventListener('click', doAddWin)
  document.getElementById('wi')?.addEventListener('keydown', e => { if (e.key === 'Enter') doAddWin() })
  document.getElementById('wi')?.focus()

  document.getElementById('wp')?.addEventListener('click', () => { if (winsPage > 0) { winsPage--; renderWins() } })
  document.getElementById('wn')?.addEventListener('click', async () => {
    const { wins } = await chrome.storage.local.get('wins')
    if ((winsPage + 1) * winsPerPage < wins.length) { winsPage++; renderWins() }
  })

  el.querySelectorAll('.wc').forEach(b => b.addEventListener('click', async e => {
    await Store.toggleCelebrate(e.currentTarget.dataset.id)
    Confetti.burst()
    renderWins()
  }))
  el.querySelectorAll('.wd').forEach(b => b.addEventListener('click', async e => {
    await Store.deleteWin(e.currentTarget.dataset.id)
    const { wins } = await chrome.storage.local.get('wins')
    if (winsPage > 0 && winsPage * winsPerPage >= wins.length) winsPage--
    renderWins()
  }))
}

async function doAddWin() {
  const input = document.getElementById('wi')
  const text = input?.value.trim()
  if (!text) return
  await Store.addWin(text)
  winsPage = 0
  await renderWins()
  Confetti.burst()
}

function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML }

// === Focus Tab ===
async function renderFocus() {
  const el = document.getElementById('tab-focus')
  if (!el) return
  const { focus } = await chrome.storage.local.get('focus')
  if (!focus) {
    el.innerHTML = `
      <div class="focus-empty">
        <div class="icon">🎯</div>
        <div class="title">What matters now?</div>
        <div class="subtitle">One focus at a time.</div>
        <div class="win-input-row" style="width:100%;">
          <input class="win-input" id="fi" type="text" placeholder="Your one focus..." />
          <button class="win-add-btn" id="fs" style="background:var(--focus-color);color:#fff;">+</button>
        </div>
      </div>
    `
    document.getElementById('fs')?.addEventListener('click', doSetFocus)
    document.getElementById('fi')?.addEventListener('keydown', e => { if (e.key === 'Enter') doSetFocus() })
    setTimeout(() => document.getElementById('fi')?.focus(), 50)
  } else {
    el.innerHTML = `
      <div class="focus-active">
        <div class="focus-card">
          <div class="focus-text">${escHtml(focus.text)}</div>
          <div class="focus-date">Started ${new Date(focus.createdAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</div>
        </div>
        <button class="focus-complete-btn" id="fc">Complete ✓</button>
      </div>
    `
    document.getElementById('fc')?.addEventListener('click', async () => {
      await Store.clearFocus()
      Confetti.burst()
      renderFocus()
    })
  }
}

async function doSetFocus() {
  const input = document.getElementById('fi')
  if (!input) return
  const text = input.value.trim()
  if (!text) return
  await Store.setFocus(text)
  renderFocus()
}

// === Zikir Tab ===
let zCount = 100, zTotal = 100, zPreset = 100, zRunning = false, zInterval = null
const zPresets = [30, 100, 300, 1000]

function renderZikir() {
  const el = document.getElementById('tab-zikir')
  if (!el) return
  const pct = zTotal > 0 ? ((zTotal - zCount) / zTotal) * 100 : 0
  el.innerHTML = `
    <div class="zikir-container">
      <div class="zikir-label">Count</div>
      <div class="zikir-count">${zCount}</div>
      <div class="zikir-progress"><div class="zikir-progress-bar" style="width:${pct}%"></div></div>
      <div class="zikir-presets">${zPresets.map(p => `<button class="zp" data-v="${p}"${p === zPreset ? ' style="background:var(--zikir-color);color:#000;border-color:var(--zikir-color);"' : ''}>${p}</button>`).join('')}</div>
      <div class="zikir-controls">
        <button class="zikir-btn start" id="zs" ${zCount <= 0 && !zRunning ? 'disabled' : ''}>${zRunning ? '⏸ Pause' : zCount < zTotal ? '▶ Continue' : '▶ Start'}</button>
        <button class="zikir-btn reset" id="zr">↺ Reset</button>
      </div>
    </div>
  `
  document.getElementById('zs')?.addEventListener('click', () => { if (zRunning) { clearInterval(zInterval); zRunning = false; renderZikir() } else { zStart() } })
  document.getElementById('zr')?.addEventListener('click', () => { zStop(); zCount = zPreset; zTotal = zPreset; renderZikir() })
  el.querySelectorAll('.zp').forEach(b => b.addEventListener('click', () => { if (!zRunning) { zPreset = parseInt(b.dataset.v); zCount = zPreset; zTotal = zPreset; renderZikir() } }))
}

function zStart() {
  if (zRunning) return
  if (zCount <= 0) { zCount = zPreset; zTotal = zPreset }
  zRunning = true; renderZikir()
  zInterval = setInterval(() => {
    if (zCount > 0) { zCount--; renderZikir(); if (zCount === 0) { zStop(); Confetti.burst() } }
    else zStop()
  }, 200)
}
function zStop() { zRunning = false; if (zInterval) { clearInterval(zInterval); zInterval = null } renderZikir() }

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
  function r() {
    const s = slides[step]
    document.body.innerHTML = `
      <div class="ob-overlay" style="font-family:var(--font);">
        <div class="ob-slide">
          <div class="ob-icon">${s.icon}</div>
          <div class="ob-title">${s.title}</div>
          <div class="ob-text">${s.text}</div>
        </div>
        <div class="ob-dots">${slides.map((_, i) => `<div class="ob-dot${i === step ? ' active' : ''}"></div>`).join('')}</div>
        <button class="ob-btn" id="obn">${step === slides.length - 1 ? 'Start' : 'Next'}</button>
        ${step < slides.length - 1 ? '<button class="ob-skip" id="obs">Skip</button>' : ''}
      </div>
    `
    document.getElementById('obn')?.addEventListener('click', async () => {
      if (step >= slides.length - 1) { await chrome.storage.local.set({ onboardingDone: true }); location.reload() }
      else { step++; r() }
    })
    document.getElementById('obs')?.addEventListener('click', async () => { await chrome.storage.local.set({ onboardingDone: true }); location.reload() })
  }
  r()
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
      const tab = document.getElementById(`tab-${btn.dataset.tab}`)
      if (tab) tab.classList.add('active')
      if (btn.dataset.tab === 'wins') renderWins()
      else if (btn.dataset.tab === 'focus') renderFocus()
    })
  })

  document.getElementById('theme-btn')?.addEventListener('click', () => Theme.cycle())

  await renderWins()
  await renderFocus()
  renderZikir()
})
