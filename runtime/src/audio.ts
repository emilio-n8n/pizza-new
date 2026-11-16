const BIAS = 0x84
const CLIP = 32635

export function mulawDecode(value: number): number {
  let u = ~value & 0xff
  const sign = u & 0x80
  const exponent = (u >> 4) & 0x07
  const mantissa = u & 0x0f
  let sample = ((mantissa << 3) + BIAS) << exponent
  sample -= BIAS
  return sign ? -sample : sample
}

export function mulawEncode(sample: number): number {
  let value = sample
  let sign = 0
  if (value < 0) {
    value = -value
    sign = 0x80
  }
  if (value > CLIP) value = CLIP
  value += BIAS

  let exponent = 7
  for (let mask = 0x4000; (value & mask) === 0 && exponent > 0; mask >>= 1) {
    exponent -= 1
  }

  const mantissa = (value >> (exponent + 3)) & 0x0f
  return ~(sign | (exponent << 4) | mantissa) & 0xff
}

export function mulawToPcm16(mulaw: Uint8Array): Int16Array {
  const pcm = new Int16Array(mulaw.length)
  for (let i = 0; i < mulaw.length; i += 1) {
    pcm[i] = mulawDecode(mulaw[i])
  }
  return pcm
}

export function pcm16ToMulaw(pcm: Int16Array): Buffer {
  const out = Buffer.alloc(pcm.length)
  for (let i = 0; i < pcm.length; i += 1) {
    out[i] = mulawEncode(pcm[i])
  }
  return out
}

export function pcm16LeToSamples(buffer: Buffer): Int16Array {
  const samples = new Int16Array(Math.floor(buffer.length / 2))
  for (let i = 0; i < samples.length; i += 1) {
    samples[i] = buffer.readInt16LE(i * 2)
  }
  return samples
}

export function samplesToPcm16Le(samples: Int16Array): Buffer {
  const buffer = Buffer.alloc(samples.length * 2)
  for (let i = 0; i < samples.length; i += 1) {
    buffer.writeInt16LE(samples[i], i * 2)
  }
  return buffer
}

export function resample(
  input: Int16Array,
  fromRate: number,
  toRate: number,
): Int16Array {
  if (fromRate === toRate) return input

  const ratio = fromRate / toRate
  const length = Math.max(1, Math.round((input.length * toRate) / fromRate))
  const output = new Int16Array(length)

  if (toRate < fromRate) {
    const window = Math.max(1, Math.floor(ratio))
    for (let i = 0; i < length; i += 1) {
      const start = Math.floor(i * ratio)
      let sum = 0
      let count = 0
      for (let j = 0; j < window; j += 1) {
        const index = start + j
        if (index >= input.length) break
        sum += input[index]
        count += 1
      }
      output[i] = count > 0 ? Math.round(sum / count) : 0
    }
    return output
  }

  for (let i = 0; i < length; i += 1) {
    const position = i * ratio
    const low = Math.floor(position)
    const high = Math.min(low + 1, input.length - 1)
    const fraction = position - low
    output[i] = Math.round(
      input[low] * (1 - fraction) + input[high] * fraction,
    )
  }
  return output
}

export function encodeWav(pcm: Int16Array, sampleRate = 8000): Buffer {
  const data = samplesToPcm16Le(pcm)
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(data.length, 40)
  return Buffer.concat([header, data])
}

export function splitFrames(buffer: Buffer, size = 160): Buffer[] {
  const frames: Buffer[] = []
  for (let offset = 0; offset < buffer.length; offset += size) {
    frames.push(buffer.subarray(offset, Math.min(offset + size, buffer.length)))
  }
  return frames
}

export function silenceMulaw(milliseconds: number): Buffer {
  const frames = Math.round(milliseconds / 20)
  return Buffer.alloc(frames * 160, 0xff)
}
