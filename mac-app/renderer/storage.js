const Store = {
  _data: null,

  async init() {
    this._data = await window.electronAPI.getData()
    if (!this._data.settings) this._data.settings = { theme: 'dark' }
    if (!this._data.wins) this._data.wins = []
    return this._data
  },

  getData() {
    return this._data
  },

  async save() {
    await window.electronAPI.saveData(this._data)
  },

  addWin(text) {
    const win = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      text,
      createdAt: Date.now(),
      celebrated: false,
    }
    this._data.wins.unshift(win)
    this.save()
    return win
  },

  toggleCelebrate(id) {
    const win = this._data.wins.find(w => w.id === id)
    if (win) {
      win.celebrated = !win.celebrated
      this.save()
    }
    return win
  },

  deleteWin(id) {
    this._data.wins = this._data.wins.filter(w => w.id !== id)
    this.save()
  },

  getWins() {
    return this._data.wins
  },

  setFocus(text) {
    const focus = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      text,
      createdAt: Date.now(),
      completed: false,
    }
    this._data.focus = focus
    this.save()
    return focus
  },

  getFocus() {
    return this._data.focus
  },

  clearFocus() {
    this._data.focus = null
    this.save()
  },

  getSetting(key) {
    return this._data.settings?.[key]
  },

  setSetting(key, value) {
    if (!this._data.settings) this._data.settings = {}
    this._data.settings[key] = value
    this.save()
  },
}
