const Celebrate = {
  particles: [],
  canvas: null,
  ctx: null,
  animFrame: null,

  init() {
    this.canvas = document.getElementById('celebration-canvas')
    this.ctx = this.canvas.getContext('2d')
    this.resize()
    window.addEventListener('resize', () => this.resize())
  },

  resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
    }
  },

  burst(count = 40) {
    const colors = ['#00FF87', '#FFD700', '#FF6B6B', '#64D8FF', '#C084FC', '#FF87C4', '#FFA500']
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 14 - 4,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.008 + Math.random() * 0.015,
        gravity: 0.25,
      })
    }
    if (!this.animFrame) this.animate()
  },

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.particles = this.particles.filter(p => p.life > 0)

    for (const p of this.particles) {
      p.x += p.vx
      p.vy += p.gravity
      p.y += p.vy
      p.life -= p.decay
      this.ctx.globalAlpha = Math.max(0, p.life)
      this.ctx.fillStyle = p.color
      this.ctx.beginPath()
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
      this.ctx.fill()
    }
    this.ctx.globalAlpha = 1

    if (this.particles.length > 0) {
      this.animFrame = requestAnimationFrame(() => this.animate())
    } else {
      this.animFrame = null
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
  },
}
