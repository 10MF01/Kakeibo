// Some host environments (e.g. this machine's shell) inherit ELECTRON_RUN_AS_NODE=1
// from a parent Electron-based process. Even an *empty* value for that var makes
// Electron boot in plain-Node mode (no app/BrowserWindow APIs), so `cross-env
// ELECTRON_RUN_AS_NODE=` is not enough — the key must be deleted entirely before
// electron-vite spawns the electron binary.
delete process.env.ELECTRON_RUN_AS_NODE

const { spawn } = require('node:child_process')

const [, , cmd, ...args] = process.argv

const child = spawn(cmd, args, {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32'
})
child.on('exit', (code) => process.exit(code ?? 0))
