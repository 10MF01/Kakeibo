// One-off asset generator: rasterizes the hand-authored app icon SVG into
// resources/icon.png via a hidden Electron BrowserWindow (electron-builder
// auto-derives the Windows .ico from this PNG at build time). Re-run this
// script any time the SVG design below needs to change; it is not part of
// the app's runtime.
delete process.env.ELECTRON_RUN_AS_NODE

const path = require('node:path')
const fs = require('node:fs')
const { app, BrowserWindow } = require('electron')

const SIZE = 1024

// Simplified soroban (abacus): a wooden frame with a divider beam, 4 vertical
// rods, one bead above the beam and three below on each rod (flat/schematic,
// not a literal bead count) — reads clearly even scaled down to 16px.
// Canvas is fully transparent (no background plate) so the icon reads as a
// cutout abacus glyph rather than a colored app tile. Beads alternate
// black/ivory — a traditional two-tone abacus palette — each with a rim
// stroke in the opposite tonal family so the bead stays legible whether it
// lands over a light or a dark taskbar/title-bar background.
const FRAME_COLOR = '#7A4A1E'
const FRAME_LIGHT = '#D9A24B'
const ROD_COLOR = '#5C3717'
const BEAD_FILLS = ['#1F1F1F', '#F7F5EF']
const BEAD_STROKES = ['#D9A24B', '#3A2313']

const FRAME_X = 190
const FRAME_Y = 260
const FRAME_W = 644
const FRAME_H = 504
const BEAM_Y = FRAME_Y + 168
const ROD_XS = [190 + 644 * 0.18, 190 + 644 * 0.39, 190 + 644 * 0.61, 190 + 644 * 0.82]
const BEAD_R = 34

function bead(cx, cy, toneIndex) {
  const fill = BEAD_FILLS[toneIndex % BEAD_FILLS.length]
  const stroke = BEAD_STROKES[toneIndex % BEAD_STROKES.length]
  return `<circle cx="${cx}" cy="${cy}" r="${BEAD_R}" fill="${fill}" stroke="${stroke}" stroke-width="5" />`
}

const rods = ROD_XS.map(
  (x) => `<line x1="${x}" y1="${FRAME_Y + 16}" x2="${x}" y2="${FRAME_Y + FRAME_H - 16}" stroke="${ROD_COLOR}" stroke-width="10" stroke-linecap="round" />`
).join('\n    ')

const upperBeads = ROD_XS.map((x, i) =>
  bead(x, FRAME_Y + 78 - (i % 2 === 0 ? 0 : 10), i)
).join('\n    ')

const lowerBeads = ROD_XS.flatMap((x, i) =>
  [0, 1, 2].map((row) =>
    bead(x, BEAM_Y + 90 + row * 84 + (i % 2 === 0 ? 0 : 8), i + row + 1)
  )
).join('\n    ')

const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 1024 1024">
  <rect x="${FRAME_X}" y="${FRAME_Y}" width="${FRAME_W}" height="${FRAME_H}" rx="28" fill="none" stroke="${FRAME_COLOR}" stroke-width="34" />
  <rect x="${FRAME_X + 6}" y="${FRAME_Y + 6}" width="${FRAME_W - 12}" height="12" rx="6" fill="${FRAME_LIGHT}" opacity="0.6" />
  <rect x="${FRAME_X - 4}" y="${BEAM_Y}" width="${FRAME_W + 8}" height="20" rx="10" fill="${FRAME_COLOR}" />
  ${rods}
  ${upperBeads}
  ${lowerBeads}
</svg>
`.trim()

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
    </style>
  </head>
  <body>${SVG}</body>
</html>`

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: SIZE,
    height: SIZE,
    useContentSize: true,
    frame: false,
    show: false,
    backgroundColor: '#00000000',
    transparent: true
  })

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
  await new Promise((resolve) => setTimeout(resolve, 200))

  const image = await win.webContents.capturePage()
  const outPath = path.join(__dirname, '..', 'resources', 'icon.png')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, image.toPNG())
  console.log('Icon written to', outPath, image.getSize())

  app.quit()
})
