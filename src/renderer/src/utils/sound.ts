let audioContext: AudioContext | null = null

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }
  return audioContext
}

/** Short filtered noise burst — the percussive "clink" transient of a coin striking something. */
function playClinkTransient(
  ctx: AudioContext,
  startTime: number,
  duration: number,
  peak: number,
  filterFreq: number
): void {
  const bufferSize = Math.max(1, Math.ceil(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = filterFreq

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(peak, startTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start(startTime)
  source.stop(startTime + duration)
}

/** A bright, fast-decaying metallic "ting" — a triangle wave reads more like struck metal than a sine. */
function playCoinChime(
  ctx: AudioContext,
  startTime: number,
  freq: number,
  duration: number,
  peak: number
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(peak, startTime + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

/** A handful of coins landing in a pouch: an initial clink transient followed by
 *  a few staggered, bright metallic dings — deliberately more "money" than a plain chime. */
export function playIncomeSound(): void {
  const ctx = getContext()
  const now = ctx.currentTime
  playClinkTransient(ctx, now, 0.025, 0.14, 2500)
  playCoinChime(ctx, now, 2637.0, 0.2, 0.16) // E7
  playClinkTransient(ctx, now + 0.06, 0.02, 0.1, 3000)
  playCoinChime(ctx, now + 0.07, 3135.96, 0.18, 0.13) // G7
  playClinkTransient(ctx, now + 0.13, 0.02, 0.08, 2200)
  playCoinChime(ctx, now + 0.15, 2093.0, 0.22, 0.11) // C7
}

/** A single, lower-pitched coin drop — money leaving, distinct in both timbre and length. */
export function playExpenseSound(): void {
  const ctx = getContext()
  const now = ctx.currentTime
  playClinkTransient(ctx, now, 0.02, 0.1, 1500)
  playCoinChime(ctx, now, 1567.98, 0.18, 0.15) // G6
}
