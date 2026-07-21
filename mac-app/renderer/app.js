document.addEventListener('DOMContentLoaded', async () => {
  await Store.init()

  Theme.init()
  Celebrate.init()
  Wins.init()
  Focus.init()
  Zikir.init()

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))

      btn.classList.add('active')
      const tab = document.getElementById(`tab-${btn.dataset.tab}`)
      if (tab) tab.classList.add('active')

      // Re-render active tab
      if (btn.dataset.tab === 'wins') Wins.render()
      else if (btn.dataset.tab === 'focus') Focus.render()
      else if (btn.dataset.tab === 'zikir') Zikir.render()
    })
  })

  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    Theme.cycle()
  })

  // Listen for data updates from main
  window.electronAPI.onDataUpdated((data) => {
    Store._data = data
    const active = document.querySelector('.tab-btn.active')
    if (active) {
      const tab = active.dataset.tab
      if (tab === 'wins') Wins.render()
      else if (tab === 'focus') Focus.render()
    }
  })
})
