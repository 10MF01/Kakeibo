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

const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 1024 1024">
  <rect x="0" y="0" width="1024" height="1024" rx="200" fill="#0F8C46" />
  <circle cx="512" cy="512" r="320" fill="#FFFFFF" />
  <circle cx="512" cy="512" r="268" fill="none" stroke="#0F8C46" stroke-width="14" />
  <text
    x="512"
    y="512"
    font-family="'Segoe UI', 'PingFang SC', 'Hiragino Sans', Arial, sans-serif"
    font-size="360"
    font-weight="700"
    fill="#0F8C46"
    text-anchor="middle"
    dominant-baseline="central"
  >&#165;</text>
</svg>
`.trim()

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; background: transparent; }
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
