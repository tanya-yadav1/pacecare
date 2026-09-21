// Gentle, built-in melodies for the Listen page. Everything is synthesized
// locally with WebAudio so music plays instantly, offline, with no accounts.

type Note = [frequency: number, beats: number];

const MELODIES: Record<string, Note[]> = {
  "golden-hour": [
    [261.63, 1], [329.63, 1], [392.0, 1], [329.63, 1],
    [293.66, 1], [349.23, 1], [440.0, 1], [392.0, 1],
  ],
  "garden-path": [
    [349.23, 1], [440.0, 1], [523.25, 1], [440.0, 1],
    [392.0, 1], [329.63, 1], [349.23, 2],
  ],
  "steady-heart": [
    [293.66, 1], [369.99, 1], [440.0, 1], [493.88, 1],
    [440.0, 1], [369.99, 1], [329.63, 2],
  ],
  "blue-skies": [
    [392.0, 1], [493.88, 1], [587.33, 1], [493.88, 1],
    [523.25, 1], [440.0, 1], [392.0, 2],
  ],
};

const FALLBACK: Note[] = [
  [329.63, 1], [392.0, 1], [440.0, 1], [392.0, 1],
];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let scheduler: number | null = null;
let currentId: string | null = null;
let paused = false;

function ensureContext() {
  if (!ctx) {
    const scope = window as typeof window & { webkitAudioContext?: typeof AudioContext };
    const Ctor = scope.AudioContext ?? scope.webkitAudioContext;
    if (!Ctor) throw new Error("This browser cannot play music.");
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.14;
    master.connect(ctx.destination);
    (window as unknown as Record<string, unknown>)["__paceMusicState"] = () => ctx?.state ?? "none";
  }
  return ctx;
}

function scheduleNote(context: AudioContext, frequency: number, start: number, length: number) {
  if (!master) return;
  const osc = context.createOscillator();
  const envelope = context.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(0.9, start + 0.05);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.1, length - 0.05));
  osc.connect(envelope);
  envelope.connect(master);
  osc.start(start);
  osc.stop(start + length + 0.05);
}

export async function playSong(id: string, bpm: number) {
  const context = ensureContext();
  await context.resume();
  paused = false;
  if (currentId === id && scheduler !== null) return; // resume after pause
  stopScheduler();
  currentId = id;
  const notes = MELODIES[id] ?? FALLBACK;
  const beat = 60 / Math.max(40, bpm);
  let step = 0;
  let nextTime = context.currentTime + 0.1;
  scheduler = window.setInterval(() => {
    while (nextTime < context.currentTime + 0.4) {
      const [frequency, beats] = notes[step % notes.length] ?? [330, 1];
      scheduleNote(context, frequency, nextTime, beat * beats);
      nextTime += beat * beats;
      step += 1;
    }
  }, 120);
}

export async function pauseSong() {
  if (!ctx || paused) return;
  paused = true;
  await ctx.suspend();
}

export async function resumeSong() {
  if (!ctx) return;
  paused = false;
  await ctx.resume();
}

function stopScheduler() {
  if (scheduler !== null) {
    window.clearInterval(scheduler);
    scheduler = null;
  }
}

export function stopSong() {
  stopScheduler();
  currentId = null;
  paused = false;
  if (ctx && ctx.state === "running") void ctx.suspend();
}

export function currentSongId() {
  return currentId;
}

let volume = 0.14;

export function musicVolume() {
  return volume;
}

export function setMusicVolume(value: number) {
  volume = Math.min(0.4, Math.max(0, value));
  if (master) master.gain.value = volume;
}
