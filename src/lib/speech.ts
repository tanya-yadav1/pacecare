type SpeechEvent = { type?: string; audio?: string; message?: string };

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export async function speakInstructions(text: string) {
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) throw new Error("Audio playback is not supported on this device.");

  const context = new AudioContextClass({ sampleRate: 24000 });
  await context.resume();
  const unlocker = context.createOscillator();
  const silentGain = context.createGain();
  silentGain.gain.value = 0;
  unlocker.connect(silentGain);
  silentGain.connect(context.destination);
  unlocker.start();
  let playhead = 0;
  let pending = new Uint8Array(0);
  let receivedAudio = false;
  let completed = false;

  const play = (incoming: Uint8Array) => {
    const bytes = new Uint8Array(pending.length + incoming.length);
    bytes.set(pending);
    bytes.set(incoming, pending.length);
    const usable = bytes.length - (bytes.length % 2);
    pending = bytes.slice(usable);
    if (!usable) return;
    const samples = new Float32Array(usable / 2);
    const view = new DataView(bytes.buffer, bytes.byteOffset, usable);
    for (let index = 0; index < samples.length; index += 1) samples[index] = view.getInt16(index * 2, true) / 32768;
    const buffer = context.createBuffer(1, samples.length, 24000);
    buffer.getChannelData(0).set(samples);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    playhead = playhead === 0 ? context.currentTime + 0.05 : Math.max(playhead, context.currentTime);
    void context.resume();
    source.start(playhead);
    playhead += buffer.duration;
    receivedAudio = true;
  };

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
      if (payload.type === "speech.audio.delta" && payload.audio) play(decodeBase64(payload.audio));
      if (payload.type === "speech.audio.done") completed = true;
      if (payload.message) throw new Error(payload.message);
    }
  }
  if (!receivedAudio || !completed) throw new Error("Spoken instructions could not be completed.");
  const remainingSeconds = Math.max(0, playhead - context.currentTime);
  await new Promise((resolve) => window.setTimeout(resolve, remainingSeconds * 1000 + 150));
  unlocker.stop();
  await context.close();
}