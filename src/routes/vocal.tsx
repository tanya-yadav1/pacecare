import { createFileRoute } from "@tanstack/react-router";
import { Hand, Mic, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/vocal")({
  head: () => ({
    meta: [
      { title: "Vocal & Digital Therapies — VitaMove" },
      { name: "description", content: "Speech rehabilitation with live loudness feedback plus finger agility mini-games." },
      { property: "og:title", content: "Vocal & Digital Therapies — VitaMove" },
      { property: "og:description", content: "Speech rehabilitation with live loudness feedback plus finger agility mini-games." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VocalTherapies,
});

const prompts = [
  "The bright morning sun warms the quiet garden path.",
  "I speak with a strong, clear and confident voice today.",
  "Purple parrots picked peppers by the rippling river.",
  "Every steady breath makes my words easier to hear.",
];

function VocalTherapies() {
  return (
    <div className="page">
      <p className="eyebrow">Vocal & Digital Therapies</p>
      <h1>Louder voice. Nimbler hands.</h1>
      <div className="mt-9 grid gap-6 xl:grid-cols-2">
        <SpeechBoard />
        <PinchStretch />
      </div>
    </div>
  );
}

function SpeechBoard() {
  const [index, setIndex] = useState(0);
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stop = useRef<() => void>(() => {});

  useEffect(() => () => stop.current(), []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let raf = 0;
      const loop = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) sum += ((v - 128) / 128) ** 2;
        const rms = Math.sqrt(sum / data.length);
        const db = Math.max(0, Math.round(20 * Math.log10(rms || 1e-5) + 90));
        setLevel(db);
        setPeak((p) => Math.max(p, db));
        raf = requestAnimationFrame(loop);
      };
      loop();
      stop.current = () => { cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); void ctx.close(); setLive(false); };
      setLive(true);
    } catch {
      setError("Microphone permission is required for live speech feedback.");
    }
  };

  const target = level >= 55;

  return (
    <section className="feature-card">
      <h2>Speech rehabilitation board</h2>
      <p className="mt-2 text-muted-foreground">Read the sentence aloud and push the bars into the green target zone.</p>
      <blockquote className="my-6 rounded-lg bg-primary p-6 text-2xl font-extrabold text-primary-foreground">{prompts[index]}</blockquote>
      <div className="flex h-44 items-end gap-2 rounded-lg border-2 border-border bg-surface p-4">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className={`flex-1 rounded-t transition-all ${target ? "bg-success" : "bg-primary"}`} style={{ height: `${Math.max(4, Math.min(100, level - i * 1.6))}%` }} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-extrabold"><Volume2 className={target ? "text-success" : "text-primary"} /> {level} dB {target ? "· Target volume reached" : "· Speak up to reach 55 dB"}</span>
        <span className="text-muted-foreground">Session peak: {peak} dB</span>
      </div>
      {error && <p className="mt-4 font-bold text-destructive">{error}</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button size="xl" variant="amber" onClick={live ? () => stop.current() : start}><Mic /> {live ? "Stop Feedback" : "Start Live Feedback"}</Button>
        <Button size="xl" variant="outline" onClick={() => { setIndex((i) => (i + 1) % prompts.length); setPeak(0); }}>Next Sentence</Button>
      </div>
    </section>
  );
}

function PinchStretch() {
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(30);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [mode, setMode] = useState<"pinch" | "stretch">("pinch");
  const [spot, setSpot] = useState({ x: 45, y: 45 });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTime((t) => { if (t <= 1) { clearInterval(id); setRunning(false); return 0; } return t - 1; }), 1000);
    return () => clearInterval(id);
  }, [running]);

  const next = () => {
    setMode(Math.random() > 0.5 ? "pinch" : "stretch");
    setSpot({ x: 8 + Math.random() * 78, y: 8 + Math.random() * 74 });
  };

  const start = () => { setRunning(true); setTime(30); setHits(0); setMisses(0); next(); };

  return (
    <section className="feature-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2>Pinch & Stretch agility</h2>
        <b className="text-3xl">{time}s</b>
      </div>
      <p className="mt-2 text-muted-foreground">Tap the small target for a precise <b>pinch</b>, the wide target for a full <b>stretch</b>.</p>
      <div
        className="relative mt-5 h-80 overflow-hidden rounded-lg border-2 border-border bg-secondary"
        onClick={() => { if (running) setMisses((m) => m + 1); }}
      >
        {running ? (
          <button
            onClick={(e) => { e.stopPropagation(); setHits((h) => h + 1); next(); }}
            aria-label={mode === "pinch" ? "Pinch target" : "Stretch target"}
            className={`absolute rounded-full border-4 font-extrabold transition-all ${mode === "pinch" ? "h-16 w-16 border-primary bg-accent text-accent-foreground" : "h-32 w-32 border-success bg-success text-success-foreground"}`}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          >
            {mode === "pinch" ? "Pinch" : "Stretch"}
          </button>
        ) : (
          <div className="grid h-full place-items-center text-center">
            <div>
              <Hand className="mx-auto h-14 w-14 text-primary" />
              <p className="mt-3 font-bold">{time === 0 ? "Round complete — great finger control." : "Press start to begin the agility round."}</p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="feature-card"><b>Targets hit</b><strong className="block text-4xl">{hits}</strong></div>
        <div className="feature-card"><b>Missed taps</b><strong className="block text-4xl">{misses}</strong></div>
        <div className="feature-card"><b>Accuracy</b><strong className="block text-4xl">{hits + misses ? Math.round((hits / (hits + misses)) * 100) : 0}%</strong></div>
      </div>
      <Button size="xl" variant="amber" className="mt-5" onClick={start} disabled={running}>Start 30-Second Round</Button>
    </section>
  );
}
