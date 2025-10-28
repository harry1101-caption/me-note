// Audio processing utilities for voice assistant core

export const SAMPLE_RATE = 24000;
export const CHANNELS = 1;

/**
 * Resample audio from a given source sample rate to a target sample rate using
 * linear interpolation.
 *
 * @param input The Float32 PCM samples to convert
 * @param sourceRate The sample rate that produced the input
 * @param targetRate The desired sample rate
 * @returns A Float32Array containing audio at the target sample rate
 */
export function resampleToTarget(
  input: Float32Array,
  sourceRate: number,
  targetRate: number
): Float32Array {
  if (sourceRate === targetRate) {
    return input;
  }

  if (!Number.isFinite(sourceRate) || !Number.isFinite(targetRate)) {
    throw new Error("Invalid sample rates provided for resampling");
  }

  if (sourceRate <= 0 || targetRate <= 0) {
    throw new Error("Sample rates must be positive numbers");
  }

  const ratio = sourceRate / targetRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outputLength);

  let prevIndex = 0;
  let nextIndex = 1;
  let prevSample = input[0] ?? 0;
  let nextSample = input[1] ?? prevSample;

  for (let i = 0; i < outputLength; i++) {
    const sourceIndex = i * ratio;
    prevIndex = Math.floor(sourceIndex);
    nextIndex = Math.min(prevIndex + 1, input.length - 1);
    prevSample = input[prevIndex] ?? 0;
    nextSample = input[nextIndex] ?? prevSample;
    const t = sourceIndex - prevIndex;
    output[i] = prevSample + (nextSample - prevSample) * t;
  }

  return output;
}

/**
 * Convert Float32Array to PCM16 ArrayBuffer
 */
export function f32ToPcm16(f32: Float32Array): ArrayBuffer {
  const buf = new ArrayBuffer(f32.length * 2);
  const dv = new DataView(buf);

  for (let i = 0; i < f32.length; i++) {
    const s = Math.max(-1, Math.min(1, f32[i]));
    dv.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buf;
}

/**
 * Convert PCM16 ArrayBuffer to Float32Array
 */
export function pcm16ToF32(buf: ArrayBuffer): Float32Array {
  const dv = new DataView(buf);
  const f32 = new Float32Array(buf.byteLength / 2);

  for (let i = 0; i < f32.length; i++) {
    const s = dv.getInt16(i * 2, true);
    f32[i] = s / (s < 0 ? 0x8000 : 0x7fff);
  }

  return f32;
}

/**
 * Create AudioWorklet processor code as a blob URL
 */
export function createAudioProcessorBlobUrl(): string {
  const processorCode = `
    class AudioProcessor extends AudioWorkletProcessor {
      constructor(options) {
        super();
        this.bufferSize = options.processorOptions?.bufferSize || 2048;
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
      }

      process(inputs) {
        const input = inputs[0];
        if (input.length > 0) {
          const inputData = input[0];
          for (let i = 0; i < inputData.length; i++) {
            this.buffer[this.bufferIndex++] = inputData[i];
            if (this.bufferIndex >= this.bufferSize) {
              this.port.postMessage(this.buffer.slice());
              this.bufferIndex = 0;
            }
          }
        }
        return true;
      }
    }
    registerProcessor('audio-processor', AudioProcessor);
  `;

  return "data:application/javascript;base64," + btoa(processorCode);
}
