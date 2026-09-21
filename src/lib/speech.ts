type SpeechEvent = { type?: string; audio?: string; message?: string };

let player: HTMLAudioElement | null = null;

// Browsers (and the preview iframe) block audio until the person interacts with
// the page. We remember what PACE wanted to say and speak it on the first tap.
let unlocked = false;
let pendingText: string | null = null;
let armed = false;
const blockedListeners = new Set<(blocked: boolean) => void>();

export function onSpeechBlocked(listener: (blocked: boolean) => void) {
  blockedListeners.add(listener);
  return () => {
    blockedListeners.delete(listener);
  };
}

function setBlocked(blocked: boolean) {
  blockedListeners.forEach((listener) => listener(blocked));
}

function armUnlock() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  const release = () => {
    armed = false;
    window.removeEventListener("pointerdown", release);
    window.removeEventListener("keydown", release);
    window.removeEventListener("touchstart", release);
    // Play a silent clip inside the gesture so the shared audio element is
    // unlocked; generating the real speech takes a few seconds, by which time
    // the tap would otherwise no longer count as permission to play sound.
    primeSpeechForGesture();
    const text = pendingText;
    pendingText = null;
    if (text) void speakInstructions(text).catch(() => {});
  };
  window.addEventListener("pointerdown", release, { once: true });
  window.addEventListener("keydown", release, { once: true });
  window.addEventListener("touchstart", release, { once: true });
}

function ensurePlayer() {
  if (!player) {
    player = new Audio();
    player.preload = "auto";
  }
  return player;
}

function buildWavUrl(pcm: Uint8Array) {
  const wav = new ArrayBuffer(44 + pcm.length);
  const view = new DataView(wav);
  const write = (at: number, value: string) => { for (let index = 0; index < value.length; index += 1) view.setUint8(at + index, value.charCodeAt(index)); };
  write(0, "RIFF"); view.setUint32(4, 36 + pcm.length, true); write(8, "WAVE"); write(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, 24000, true); view.setUint32(28, 48000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  write(36, "data"); view.setUint32(40, pcm.length, true); new Uint8Array(wav, 44).set(pcm);
  return URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
}

// Call synchronously from a tap/click handler: plays a short silent clip so
// the audio element is unlocked before the real (slower) speech is ready.
export function primeSpeechForGesture() {
  if (unlocked || typeof window === "undefined") return;
  const audio = ensurePlayer();
  const url = buildWavUrl(new Uint8Array(480));
  audio.src = url;
  audio.volume = 0.01;
  void audio.play().then(() => {
    unlocked = true;
    setBlocked(false);
    URL.revokeObjectURL(url);
  }).catch(() => {});
}

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export async function speakInstructions(text: string) {
  const audio = ensurePlayer();
  audio.pause();
  audio.currentTime = 0;
  const audioParts: Uint8Array[] = [];
  let completed = false;

  const response = await fetch("/api/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok || !response.body) {
    const payload = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(payload?.message ?? "Spoken instructions are unavailable right now.");
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let remainder = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    remainder += value;
    const events = remainder.split("\n\n");
    remainder = events.pop() ?? "";
    for (const event of events) {
      const data = event.split("\n").find((line) => line.startsWith("data:"))?.slice(5).trim();
      if (!data) continue;
      const payload = JSON.parse(data) as SpeechEvent;
      if (payload.type === "speech.audio.delta" && payload.audio) audioParts.push(decodeBase64(payload.audio));
      if (payload.type === "speech.audio.done") completed = true;
      if (payload.message) throw new Error(payload.message);
    }
  }
  if (!audioParts.length || !completed) throw new Error("Spoken instructions could not be completed.");
  const byteLength = audioParts.reduce((total, part) => total + part.length, 0);
  const pcm = new Uint8Array(byteLength);
  let offset = 0;
  for (const part of audioParts) { pcm.set(part, offset); offset += part.length; }
  const url = buildWavUrl(pcm);
  audio.src = url;
  audio.volume = 1;
  try {
    await audio.play();
    unlocked = true;
    setBlocked(false);
  } catch {
    URL.revokeObjectURL(url);
    pendingText = text;
    setBlocked(true);
    armUnlock();
    return;
  }
  await new Promise<void>((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Audio playback failed on this device."));
  });
  URL.revokeObjectURL(url);
}