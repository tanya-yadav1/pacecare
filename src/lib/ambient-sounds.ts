// Gentle nature sounds and chimes, generated in the browser with WebAudio so
// nothing needs to be downloaded and no recordings are licensed from anyone.

export type AmbientKind = "rain" | "waves" | "wind" | "birds";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let nodes: AudioNode[] = [];
let timer: number | null = null;
let current: AmbientKind | null = null;
let volume = 0.5;

function ensureContext() {
  if (!ctx) {
    const scope = window as typeof window & { webkitAudioContext?: typeof AudioContext };
    const Ctor = scope.AudioContext ?? scope.webkitAudioContext;
    if (!Ctor) throw new Error("This device cannot play sounds.");
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = volume * 0.4;
    master.connect(ctx.destination);
  }
  return ctx;
}

function noiseBuffer(context: AudioContext) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  return buffer;
}

function chirp(context: AudioContext, at: number) {
  if (!master) return;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1800 + Math.random() * 900, at);
  osc.frequency.exponentialRampToValueAtTime(2600 + Math.random() * 700, at + 0.12);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.25, at + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.25);
  osc.connect(gain);
  gain.connect(master);
  osc.start(at);
  osc.stop(at + 0.3);
}

export async function playAmbient(kind: AmbientKind) {
  const context = ensureContext();
  stopAmbient();
  await context.resume();
  current = kind;

  const source = context.createBufferSource();
  source.buffer = noiseBuffer(context);
  source.loop = true;
  const filter = context.createBiquadFilter();
  const swell = context.createGain();

  if (kind === "rain") {
    filter.type = "bandpass";
    filter.frequency.value = 1400;
    filter.Q.value = 0.6;
    swell.gain.value = 0.7;
  } else if (kind === "waves") {
    filter.type = "lowpass";
    filter.frequency.value = 500;
    swell.gain.value = 0.2;
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    lfo.frequency.value = 0.12;
    lfoGain.gain.value = 0.55;
    lfo.connect(lfoGain);
    lfoGain.connect(swell.gain);
    lfo.start();
    nodes.push(lfo);
  } else if (kind === "wind") {
    filter.type = "lowpass";
    filter.frequency.value = 900;
    swell.gain.value = 0.35;
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 0.25;
    lfo.connect(lfoGain);
    lfoGain.connect(swell.gain);
    lfo.start();
    nodes.push(lfo);
  } else {
    filter.type = "lowpass";
    filter.frequency.value = 700;
    swell.gain.value = 0.16;
    timer = window.setInterval(() => {
      if (!ctx) return;
      chirp(ctx, ctx.currentTime + Math.random() * 0.4);
    }, 1500);
  }

  source.connect(filter);
  filter.connect(swell);
  if (master) swell.connect(master);
  source.start();
  nodes.push(source, filter, swell);
}

export function stopAmbient() {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  for (const node of nodes) {
    try {
      (node as OscillatorNode).stop?.();
    } catch {
      // already stopped
    }
    try {
      node.disconnect();
    } catch {
      // already disconnected
    }
  }
  nodes = [];
  current = null;
}

export function currentAmbient() {
  return current;
}

export function setAmbientVolume(next: number) {
  volume = Math.min(1, Math.max(0, next));
  if (master) master.gain.value = volume * 0.4;
}

export function ambientVolume() {
  return volume;
}

/** A soft two-note chime to end a quiet session. */
export async function playChime() {
  const context = ensureContext();
  await context.resume();
  const at = context.currentTime;
  [523.25, 659.25].forEach((frequency, index) => {
    if (!master) return;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    const start = at + index * 0.45;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.3, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.6);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + 1.7);
  });
}
