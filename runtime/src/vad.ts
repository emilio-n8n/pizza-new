import { config } from './config'

function rms(frame: Int16Array): number {
  let sum = 0
  for (let i = 0; i < frame.length; i += 1) {
    const value = frame[i]
    sum += value * value
  }
  return Math.sqrt(sum / Math.max(1, frame.length))
}

export class Vad {
  private speaking = false
  private voicedMs = 0
  private silenceMs = 0
  private frames: Int16Array[] = []
  private preroll: Int16Array[] = []
  private startedAt = 0

  onSpeechStart?: () => void

  get isSpeaking() {
    return this.speaking
  }

  push(frame: Int16Array): Int16Array | null {
    const energy = rms(frame)
    const voiced = energy >= config.vadThreshold

    if (!this.speaking) {
      this.preroll.push(frame)
      if (this.preroll.length > 6) this.preroll.shift()

      if (voiced) {
        this.voicedMs += 20
        if (this.voicedMs >= 60) {
          this.speaking = true
          this.frames = [...this.preroll]
          this.preroll = []
          this.silenceMs = 0
          this.startedAt = Date.now()
          this.onSpeechStart?.()
        }
      } else {
        this.voicedMs = 0
      }
      return null
    }

    this.frames.push(frame)

    if (voiced) {
      this.voicedMs += 20
      this.silenceMs = 0
    } else {
      this.silenceMs += 20
    }

    const totalMs = Date.now() - this.startedAt

    if (
      this.silenceMs >= config.vadSilenceMs &&
      totalMs >= config.vadMinSpeechMs
    ) {
      const result = this.flush()
      return result
    }

    return null
  }

  flush(): Int16Array | null {
    if (!this.speaking) return null

    let frames = this.frames
    if (frames.length === 0) {
      this.reset()
      return null
    }

    // Trim a part of the trailing silence, keep 120 ms of context.
    const keepSilenceFrames = 6
    const voicedEnd = frames.length - Math.floor(this.silenceMs / 20)
    const end = Math.min(
      frames.length,
      Math.max(1, voicedEnd + keepSilenceFrames),
    )
    frames = frames.slice(0, end)

    const total = frames.reduce((sum, item) => sum + item.length, 0)
    const pcm = new Int16Array(total)
    let offset = 0
    for (const frame of frames) {
      pcm.set(frame, offset)
      offset += frame.length
    }

    this.reset()
    return pcm
  }

  reset() {
    this.speaking = false
    this.voicedMs = 0
    this.silenceMs = 0
    this.frames = []
    this.preroll = []
    this.startedAt = 0
  }
}
