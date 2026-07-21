const Zikir = {
  count: 0,
  total: 100,
  preset: 100,
  running: false,
  interval: null,
  container: null,

  presets: [30, 100, 300, 1000],

  init() {
    this.container = document.getElementById('tab-zikir')
    this.preset = 100
    this.reset()
    this.render()
  },

  reset() {
    this.count = this.preset
    this.total = this.preset
    this.stop()
    this.render()
  },

  start() {
    if (this.running) return
    if (this.count <= 0) this.reset()
    this.running = true
    this.render()

    this.interval = setInterval(() => {
      if (this.count > 0) {
        this.count--
        this.render()
        if (this.count === 0) {
          this.stop()
          Celebrate.burst()
        }
      } else {
        this.stop()
      }
    }, 200)
  },

  stop() {
    this.running = false
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.render()
  },

  setPreset(val) {
    if (this.running) return
    this.preset = val
    this.reset()
  },

  render() {
    const pct = this.total > 0 ? ((this.total - this.count) / this.total) * 100 : 0

    this.container.innerHTML = `
      <div class="zikir-container">
        <div class="zikir-label">Count</div>
        <div class="zikir-count">${this.count}</div>

        <div class="zikir-progress">
          <div class="zikir-progress-bar" style="width:${pct}%"></div>
        </div>

        <div class="zikir-presets">
          ${this.presets.map(p => `
            <button class="zikir-preset-btn${p === this.preset ? ' active' : ''}" data-preset="${p}">
              ${p}
            </button>
          `).join('')}
        </div>

        <div class="zikir-controls">
          <button class="zikir-btn start" id="zikir-start-btn" ${this.count <= 0 && !this.running ? 'disabled' : ''}>
            ${this.running ? '⏸ Pause' : this.count < this.total ? '▶ Continue' : '▶ Start'}
          </button>
          <button class="zikir-btn reset" id="zikir-reset-btn">
            ↺ Reset
          </button>
        </div>
      </div>
    `

    document.getElementById('zikir-start-btn')?.addEventListener('click', () => {
      if (this.running) this.stop()
      else this.start()
    })

    document.getElementById('zikir-reset-btn')?.addEventListener('click', () => {
      this.reset()
    })

    document.querySelectorAll('.zikir-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setPreset(parseInt(e.currentTarget.dataset.preset))
      })
    })
  },
}
