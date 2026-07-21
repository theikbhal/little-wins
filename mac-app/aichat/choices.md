# Mac Menu Bar App — Architecture Decisions

## Stack
- **Electron** (native macOS menus, tray, windowing)
- **Vanilla JS** — no React/build step. Faster iteration, smaller bundle.
- **JSON file** for persistence (synchronous `fs`, stored at `~/Library/Application Support/little-wins/data.json`)

## Why Vanilla JS over React?
- Zero build step → edit and reload instantly
- App is tiny (3 tabs, simple state) — React overhead unnecessary
- Same DOM APIs, no JSX transform needed

## Menu Bar Behavior
- `Tray` with popup `BrowserWindow`
- Position window below tray icon using `tray.getBounds()`
- `blur` event closes window (click outside)
- `ctrl`+click shows context menu with Quit + Settings

## Tabs
- Wins: inline add form, paginated list (10/page), celebrate with canvas confetti
- Focus: single item, create/complete toggle
- Zikir: big counter display, preset buttons (30, 100, 300, 1000), reverse countdown with start/stop/reset

## Theme
- 3 modes: dark, light, system (follows macOS appearance)
- CSS custom properties switched via `document.documentElement.dataset.theme`
- Dark: `#000` bg, `#00FF87` accent
- Light: `#fff` bg, `#00CC6A` accent

## Storage
- `JSON` file via preload bridge (ipcRenderer → ipcMain → fs)
- Schema: `{ wins: Win[], focus: Focus | null, settings: { theme: string } }`
- Zikir state ephemeral (not persisted, resets on app quit)

## Celebrate
- Canvas-based confetti burst on win celebrate
- 50 particles, random colors, gravity + fade

## Pagination
- 10 wins per page
- Prev/Next buttons at bottom of wins list
- Count badge shows total

## Why Electron over Swift native?
- Cross-platform codebase (iPhone app is RN, but Mac app can later share logic)
- Faster to prototype for ADHD-friendly iteration
- Can later wrap same JS in PWA or Tauri if needed
