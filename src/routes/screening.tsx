import { createFileRoute } from "@tanstack/react-router";
import { Activity, Brain, Mic, PenLine, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTestScores } from "@/lib/vitamove-tests";

export const Route = createFileRoute("/screening")({
  head: () => ({
    meta: [
      { title: "Multi-Modal Screening — VitaMove" },
      { name: "description", content: "Motor, vocal and cognitive Parkinson's screening tests in one guided flow." },
      { property: "og:title", content: "Multi-Modal Screening — VitaMove" },
      { property: "og:description", content: "Motor, vocal and cognitive Parkinson's screening tests in one guided flow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Screening,
});

const tabs = [
  { id: "motor", label: "Test A · Motor", icon: Zap },
  { id: "vocal", label: "Test B · Vocal", icon: Mic },
  { id: "cognitive", label: "Test C · Cognitive", icon: Brain },
] as const;

function Screening() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("motor");
  const { scores } = useTestScores();
  return (
    <div className="page">
      <p className="eyebrow">Multi-Modal Screening (Detection)</p>
      <h1>Three quick tests. One clear picture.</h1>
      <p className="lead">Measure bradykinesia, tremor amplitude, vocal intensity and executive processing speed in under five minutes.</p>

      <div className="mt-8 flex flex-wrap gap-3">
        {tabs.map((t) => (
          <Button key={t.id} size="xl" variant={tab === t.id ? "default" : "outline"} onClick={() => setTab(t.id)}>
            <t.icon /> {t.label}
          </Button>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Summary label="Tap rate" value={scores.motorTap === null ? "—" : `${scores.motorTap} taps`} />
        <Summary label="Tremor amplitude" value={scores.tremorAmplitude === null ? "—" : `${scores.tremorAmplitude} px`} />
        <Summary label="Vocal intensity" value={scores.speech === null ? "—" : `${scores.speech} dB`} />
        <Summary label="Cognitive recall" value={scores.cognitive === null ? "—" : `${scores.cognitive}%`} />
      </div>

      <div className="mt-8">
        {tab === "motor" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <TapTest />
            <SpiralTest />
          </div>
        )}
        {tab === "vocal" && <VocalTest />}
        {tab === "cognitive" && <CognitiveTest />}
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="feature-card">
      <small className="font-bold uppercase tracking-wide text-muted-foreground">{label}</small>
      <strong className="block text-3xl">{value}</strong>
    </div>
  );
}

function TapTest() {
  const { save } = useTestScores();
  const [active, setActive] = useState(false);
  const [time, setTime] = useState(10);
  const [taps, setTaps] = useState(0);
  const [expect, setExpect] = useState<"L" | "R">("L");
  const [gaps, setGaps] = useState<number[]>([]);
  const last = useRef<number | null>(null);
  const tapsRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(id);
          setActive(false);
          save({ motorTap: tapsRef.current });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, save]);

  const tap = (side: "L" | "R") => {
    if (!active || side !== expect) return;
    const now = performance.now();
    if (last.current) setGaps((g) => [...g, now - (last.current ?? now)]);
    last.current = now;
    tapsRef.current += 1;
    setTaps(tapsRef.current);
    setExpect(side === "L" ? "R" : "L");
  };

  const mean = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;

  return (
    <section className="feature-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2>Alternating rapid tapping</h2>
        <b className="text-3xl">{time}s</b>
      </div>
      <p className="mt-2 text-muted-foreground">Alternate strictly left, right, left — the highlighted button is next.</p>
      <div className="my-6 grid grid-cols-2 gap-4">
        <Button className={`min-h-40 text-2xl ${active && expect === "L" ? "ring-4 ring-accent" : ""}`} disabled={!active} onClick={() => tap("L")}>Left Tap</Button>
        <Button className={`min-h-40 text-2xl ${active && expect === "R" ? "ring-4 ring-accent" : ""}`} disabled={!active} onClick={() => tap("R")}>Right Tap</Button>
      </div>
      <Button size="xl" variant="amber" onClick={() => { setActive(true); setTime(10); setTaps(0); tapsRef.current = 0; setGaps([]); setExpect("L"); last.current = null; }}>
        <Zap /> Start 10-Second Test
      </Button>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="feature-card"><b>Valid alternations</b><strong className="block text-4xl">{taps}</strong></div>
        <div className="feature-card"><b>Mean interval</b><strong className="block text-4xl">{mean ? Math.round(mean) : 0} ms</strong><small>Slower intervals suggest bradykinesia.</small></div>
      </div>
    </section>
  );
}

function SpiralTest() {
  const { save } = useTestScores();
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);
  const [amplitude, setAmplitude] = useState<number | null>(null);

  const guide = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 420, 420);
    ctx.strokeStyle = "rgba(120,140,170,.55)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 8; a += 0.05) {
      const r = a * 7.5;
      const x = 210 + r * Math.cos(a);
      const y = 210 + r * Math.sin(a);
      if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (ctx) guide(ctx);
  }, []);

  const pos = (e: React.PointerEvent) => {
    const rect = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * 420, y: ((e.clientY - rect.top) / rect.height) * 420 };
  };

  const down = (e: React.PointerEvent) => { drawing.current = true; points.current = []; setAmplitude(null); const ctx = canvas.current!.getContext("2d")!; guide(ctx); e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = pos(e);
    const ctx = canvas.current!.getContext("2d")!;
    const prev = points.current[points.current.length - 1];
    ctx.strokeStyle = "oklch(0.29 0.105 250)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(prev?.x ?? p.x, prev?.y ?? p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    points.current.push(p);
  };
  const up = () => {
    drawing.current = false;
    const pts = points.current;
    if (pts.length < 20) return;
    const radii = pts.map((p) => Math.hypot(p.x - 210, p.y - 210));
    const deviations: number[] = [];
    for (let i = 2; i < radii.length; i++) {
      const smoothed = ((radii[i - 2] ?? 0) + (radii[i - 1] ?? 0)) / 2;
      deviations.push(Math.abs((radii[i] ?? 0) - smoothed));
    }
    const amp = Number((deviations.reduce((a, b) => a + b, 0) / Math.max(1, deviations.length)).toFixed(2));
    setAmplitude(amp);
    save({ tremorAmplitude: amp });
  };

  return (
    <section className="feature-card">
      <h2>Spiral tracing · tremor amplitude</h2>
      <p className="mt-2 text-muted-foreground">Trace the grey spiral in one continuous motion with your finger or mouse.</p>
      <canvas
        ref={canvas}
        width={420}
        height={420}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        className="mt-5 aspect-square w-full touch-none rounded-lg border-2 border-border bg-surface"
        aria-label="Spiral tracing canvas"
      />
      <div className="mt-4 feature-card">
        <b>Extracted tremor amplitude</b>
        <strong className="block text-4xl">{amplitude === null ? "—" : `${amplitude} px`}</strong>
        <small>{amplitude === null ? "Trace the spiral to measure line deviation." : amplitude > 3 ? "Elevated deviation: consistent with tremor." : "Low deviation: steady line control."}</small>
      </div>
    </section>
  );
}

function VocalTest() {
  const { save } = useTestScores();
  const [level, setLevel] = useState(0);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(8);
  const [error, setError] = useState<string | null>(null);
  const samples = useRef<number[]>([]);
  const stop = useRef<() => void>(() => {});

  useEffect(() => () => stop.current(), []);

  const start = async () => {
    setError(null);
    samples.current = [];
    setTime(8);
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
        samples.current.push(db);
        raf = requestAnimationFrame(loop);
      };
      loop();
      stop.current = () => { cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); void ctx.close(); };
      setRunning(true);
      const id = setInterval(() => {
        setTime((t) => {
          if (t <= 1) {
            clearInterval(id);
            stop.current();
            setRunning(false);
            const s = samples.current;
            const avg = s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : 0;
            save({ speech: avg });
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } catch {
      setError("Microphone permission is required for the vocal test.");
    }
  };

  const s = samples.current;
  const avg = s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : 0;
  const variance = s.length ? Math.round(Math.sqrt(s.reduce((a, b) => a + (b - avg) ** 2, 0) / s.length)) : 0;

  return (
    <section className="feature-card mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2>Sustained vowel · hypophonia check</h2>
        <b className="text-3xl">{time}s</b>
      </div>
      <p className="mt-2 text-muted-foreground">Take a breath and hold “Aaaah” at a steady, comfortable volume for eight seconds.</p>
      <div className="my-6 flex h-40 items-end gap-2 rounded-lg bg-primary p-4">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="flex-1 rounded-t bg-accent transition-all" style={{ height: `${Math.max(4, Math.min(100, level - i * 1.4))}%` }} />
        ))}
      </div>
      <Button size="xl" variant="amber" disabled={running} onClick={start}><Mic /> Start Vocal Test</Button>
      {error && <p className="mt-4 font-bold text-destructive">{error}</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="feature-card"><b>Live intensity</b><strong className="block text-4xl">{level} dB</strong></div>
        <div className="feature-card"><b>Average intensity</b><strong className="block text-4xl">{avg} dB</strong></div>
        <div className="feature-card"><b>Consistency</b><strong className="block text-4xl">{variance ? Math.max(0, 100 - variance * 3) : 0}%</strong><small>Fluctuation: {variance} dB</small></div>
      </div>
      {!running && avg > 0 && (
        <p className="mt-5 flex items-center gap-2 font-extrabold">
          <Activity className="text-primary" />
          {avg < 45 ? "Reduced vocal intensity detected — consistent with hypophonia." : "Vocal intensity within a healthy demo range."}
        </p>
      )}
    </section>
  );
}

const cells = Array.from({ length: 16 }, (_, i) => i);

function CognitiveTest() {
  const { save } = useTestScores();
  const [phase, setPhase] = useState<"idle" | "show" | "recall" | "done">("idle");
  const [pattern, setPattern] = useState<number[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);

  const begin = () => {
    const next: number[] = [];
    while (next.length < 5) {
      const c = Math.floor(Math.random() * 16);
      if (!next.includes(c)) next.push(c);
    }
    setPattern(next);
    setPicked([]);
    setPhase("show");
    setTimeout(() => { setPhase("recall"); startedAt.current = performance.now(); }, 3000);
  };

  const pick = (c: number) => {
    if (phase !== "recall" || picked.includes(c)) return;
    const next = [...picked, c];
    setPicked(next);
    if (next.length === pattern.length) {
      const correct = next.filter((x) => pattern.includes(x)).length;
      const seconds = (performance.now() - startedAt.current) / 1000;
      setElapsed(Number(seconds.toFixed(1)));
      const accuracy = Math.round((correct / pattern.length) * 100);
      const speedPenalty = Math.min(30, Math.max(0, Math.round((seconds - 6) * 4)));
      setPhase("done");
      save({ cognitive: Math.max(0, accuracy - speedPenalty) });
    }
  };

  const correct = picked.filter((x) => pattern.includes(x)).length;

  return (
    <section className="feature-card mx-auto max-w-3xl">
      <h2>4×4 spatial memory recall</h2>
      <p className="mt-2 text-muted-foreground">Five squares light up for three seconds. Tap them back in any order.</p>
      <div className="my-6 grid grid-cols-4 gap-3">
        {cells.map((c) => {
          const lit = phase === "show" && pattern.includes(c);
          const chosen = picked.includes(c);
          const right = phase === "done" && chosen && pattern.includes(c);
          const wrong = phase === "done" && chosen && !pattern.includes(c);
          return (
            <button
              key={c}
              onClick={() => pick(c)}
              aria-label={`Grid cell ${c + 1}`}
              className={`aspect-square rounded-lg border-2 transition-colors ${lit ? "border-accent bg-accent" : right ? "border-success bg-success" : wrong ? "border-destructive bg-destructive" : chosen ? "border-primary bg-secondary" : "border-border bg-surface"}`}
            />
          );
        })}
      </div>
      <Button size="xl" variant="amber" onClick={begin} disabled={phase === "show" || phase === "recall"}><Brain /> {phase === "idle" ? "Start Memory Test" : "Run Again"}</Button>
      {phase === "recall" && <p className="mt-5 font-bold">Recall the squares — {pattern.length - picked.length} remaining.</p>}
      {phase === "done" && (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="feature-card"><b>Accuracy</b><strong className="block text-4xl">{correct}/{pattern.length}</strong></div>
          <div className="feature-card"><b>Recall time</b><strong className="block text-4xl">{elapsed}s</strong></div>
          <div className="feature-card"><b>Processing score</b><strong className="block text-4xl"><PenLine className="mr-1 inline h-6 w-6" />{Math.max(0, Math.round((correct / pattern.length) * 100) - Math.min(30, Math.max(0, Math.round((elapsed - 6) * 4))))}%</strong></div>
        </div>
      )}
    </section>
  );
}
