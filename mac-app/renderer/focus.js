const Focus = {
  container: null,

  init() {
    this.container = document.getElementById('tab-focus')
    this.render()
  },

  render() {
    const focus = Store.getFocus()

    if (!focus) {
      this.container.innerHTML = `
        <div class="focus-empty">
          <div class="icon">🎯</div>
          <div class="title">What matters now?</div>
          <div class="subtitle">One focus at a time. No lists. No overwhelm.</div>
          <div class="win-input-row" style="width:100%;">
            <input class="win-input" id="focus-input" type="text" placeholder="Your one focus..." />
            <button class="win-add-btn" id="focus-set-btn" style="background:var(--focus-color);color:#fff;">+</button>
          </div>
        </div>
      `
      const input = document.getElementById('focus-input')
      const btn = document.getElementById('focus-set-btn')

      const setHandler = () => {
        const text = input.value.trim()
        if (!text) return
        Store.setFocus(text)
        this.render()
      }

      btn?.addEventListener('click', setHandler)
      input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') setHandler()
      })
      setTimeout(() => input?.focus(), 50)
    } else {
      this.container.innerHTML = `
        <div class="focus-active">
          <div class="focus-card">
            <div class="focus-icon">🎯</div>
            <div class="focus-text">${this.escapeHtml(focus.text)}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">
              Started ${new Date(focus.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <button class="focus-complete-btn" id="focus-complete-btn">Complete ✓</button>
        </div>
      `

      document.getElementById('focus-complete-btn')?.addEventListener('click', () => {
        Store.clearFocus()
        this.render()
        Celebrate.burst()
      })
    }
  },

  escapeHtml(text) {
    const d = document.createElement('div')
    d.textContent = text
    return d.innerHTML
  },
}
