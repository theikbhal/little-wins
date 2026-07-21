const { app, Tray, Menu, BrowserWindow, ipcMain, nativeTheme, nativeImage } = require('electron')
const path = require('path')
const fs = require('fs')

let tray = null
let win = null
let dataPath = ''

const DATA_FILE = 'data.json'
const WIN_H = 520
const WIN_W = 360

function getDataPath() {
  if (!dataPath) {
    const dir = path.join(app.getPath('userData'), 'little-wins-data')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    dataPath = dir
  }
  return dataPath
}

function loadData() {
  const file = path.join(getDataPath(), DATA_FILE)
  try {
    const raw = fs.readFileSync(file, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { wins: [], focus: null, settings: { theme: 'dark' } }
  }
}

function saveData(data) {
  const file = path.join(getDataPath(), DATA_FILE)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function createTrayIcon(theme) {
  const size = 22
  const isDark = theme === 'dark' || (theme === 'system' && nativeTheme.shouldUseDarkColors)
  const color = isDark ? '%2300FF87' : '%2300CC6A'
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
  const canvas = 'data:image/svg+xml,' + svg
  return nativeImage.createFromDataURL(canvas)
}

function createWindow() {
  win = new BrowserWindow({
    width: WIN_W,
    height: WIN_H,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'))
  win.setVisibleOnAllWorkspaces(true)

  win.on('blur', () => {
    if (win && !win.webContents.isDevToolsOpened()) {
      win.hide()
    }
  })

  return win
}

function showWindow() {
  if (!win) createWindow()
  const trayBounds = tray.getBounds()
  const winBounds = win.getBounds()

  let x = Math.round(trayBounds.x + (trayBounds.width / 2) - (winBounds.width / 2))
  let y = Math.round(trayBounds.y + trayBounds.height + 4)

  const displays = require('electron').screen.getAllDisplays()
  const display = displays.find(d => {
    return trayBounds.x >= d.bounds.x && trayBounds.x <= d.bounds.x + d.bounds.width
  }) || displays[0]

  if (x + winBounds.width > display.bounds.x + display.bounds.width) {
    x = display.bounds.x + display.bounds.width - winBounds.width - 8
  }
  if (x < display.bounds.x) x = display.bounds.x + 8

  win.setPosition(x, y)
  win.show()
  win.focus()
  win.webContents.send('data-updated', loadData())
}

app.whenReady().then(() => {
  const data = loadData()
  const theme = data.settings?.theme || 'dark'

  const icon = createTrayIcon(theme)
  tray = new Tray(icon)
  tray.setToolTip('Little Wins')

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Little Wins', click: showWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ])
  tray.setContextMenu(contextMenu)

  tray.on('click', showWindow)

  createWindow()

  // IPC handlers
  ipcMain.handle('get-data', () => loadData())
  ipcMain.handle('save-data', (_, data) => { saveData(data); return true })
  ipcMain.handle('get-theme', () => {
    const d = loadData()
    return d.settings?.theme || 'dark'
  })

  nativeTheme.on('updated', () => {
    if (win) win.webContents.send('system-theme-changed', nativeTheme.shouldUseDarkColors)
  })
})

app.on('window-all-closed', () => {})

app.on('before-quit', () => {
  tray = null
  win = null
})
