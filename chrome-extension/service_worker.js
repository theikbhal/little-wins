chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ onboardingDone: false })
  }
})

async function updateBadge() {
  const { wins = [] } = await chrome.storage.local.get('wins')
  const today = new Date().toDateString()
  const count = wins.filter(w => new Date(w.createdAt).toDateString() === today).length
  if (count > 0) {
    chrome.action.setBadgeText({ text: String(count) })
    chrome.action.setBadgeBackgroundColor({ color: '#00FF87' })
  } else {
    chrome.action.setBadgeText({ text: '' })
  }
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.wins) updateBadge()
})

updateBadge()
