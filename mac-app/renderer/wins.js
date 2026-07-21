const Wins = {
  page: 0,
  perPage: 10,
  container: null,

  init() {
    this.container = document.getElementById('tab-wins')
    this.render()
  },

  get paginated() {
    const wins = Store.getWins()
    const start = this.page * this.perPage
    return {
      items: wins.slice(start, start + this.perPage),
      total: wins.length,
      page: this.page,
      totalPages: Math.max(1, Math.ceil(wins.length / this.perPage)),
    }
  },

  render() {
    const { items, total, page, totalPages } = this.paginated

    this.container.innerHTML = `
      <div class="win-input-row">
        <input class="win-input" id="win-input" type="text" placeholder="Quick win..." />
        <button class="win-add-btn" id="win-add-btn">+</button>
      </div>
      <div class="win-list" id="win-list">
        ${items.length === 0
          ? `<div style="text-align:center;padding:40px 0;color:var(--text-muted);font-size:13px;">No wins yet.<br/>Log your first one above.</div>`
          : items.map(w => this.renderItem(w)).join('')
        }
      </div>
      ${totalPages > 1 ? `
        <div class="pagination">
          <button id="page-prev" ${page === 0 ? 'disabled' : ''}>← Prev</button>
          <span class="page-info">Page ${page + 1} of ${totalPages} · ${total} wins</span>
          <button id="page-next" ${page >= totalPages - 1 ? 'disabled' : ''}>Next →</button>
        </div>
      ` : total > 0 ? `
        <div style="text-align:center;padding:8px;font-size:11px;color:var(--text-muted);">${total} win${total !== 1 ? 's' : ''}</div>
      ` : ''}
    `

    this.bindEvents()
    this.focusInput()
  },

  renderItem(w) {
    const date = new Date(w.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    })
    return `
      <div class="win-item${w.celebrated ? ' celebrated' : ''}" data-id="${w.id}">
        <button class="win-celebrate-btn" data-id="${w.id}">${w.celebrated ? '✅' : '⬜'}</button>
        <span class="win-text">${this.escapeHtml(w.text)}</span>
        <span class="win-date">${date}</span>
        <button class="win-delete-btn" data-id="${w.id}">✕</button>
      </div>
    `
  },

  escapeHtml(text) {
    const d = document.createElement('div')
    d.textContent = text
    return d.innerHTML
  },

  bindEvents() {
    const input = document.getElementById('win-input')
    const addBtn = document.getElementById('win-add-btn')

    const addHandler = () => {
      const text = input?.value.trim()
      if (!text) return
      Store.addWin(text)
      this.page = 0
      this.render()
      Celebrate.burst()
    }

    addBtn?.addEventListener('click', addHandler)
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addHandler()
    })

    document.getElementById('page-prev')?.addEventListener('click', () => {
      if (this.page > 0) { this.page--; this.render() }
    })

    document.getElementById('page-next')?.addEventListener('click', () => {
      if ((this.page + 1) * this.perPage < Store.getWins().length) {
        this.page++; this.render()
      }
    })

    document.querySelectorAll('.win-celebrate-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id
        Store.toggleCelebrate(id)
        this.render()
        Celebrate.burst()
      })
    })

    document.querySelectorAll('.win-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id
        Store.deleteWin(id)
        if (this.page > 0 && this.page * this.perPage >= Store.getWins().length) {
          this.page--
        }
        this.render()
      })
    })
  },

  focusInput() {
    setTimeout(() => document.getElementById('win-input')?.focus(), 50)
  },
}
