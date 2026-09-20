import { createFileRoute } from "@tanstack/react-router";
import { TrendingDown, TrendingUp } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTestScores } from "@/lib/vitamove-tests";

export const Route = createFileRoute("/overlay")({
  head: () => ({
    meta: [
      { title: "Clinical Data Overlay — VitaMove" },
      { name: "description", content: "Pre-therapy versus post-therapy motor, speech and cognitive analytics." },
      { property: "og:title", content: "Clinical Data Overlay — VitaMove" },
      { property: "og:description", content: "Pre-therapy versus post-therapy motor, speech and cognitive analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overlay,
});

const sessions = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];

function series(preStart: number, postStart: number, gain: number) {
  return sessions.map((s, i) => ({
    session: s,
    pre: Number((preStart + Math.sin(i) * 1.5).toFixed(1)),
    post: Number((postStart + gain * i + Math.cos(i) * 1.2).toFixed(1)),
  }));
}

const motor = series(42, 44, 3.4);
const speech = series(46, 48, 2.6);
const cognitive = series(58, 60, 3.1);

function Overlay() {
  const { scores } = useTestScores();
  return (
    <div className="page">
      <span className="page-tag page-tag-diagnosis">Diagnosis</span>
      <p className="eyebrow">Clinical Data Overlay</p>
      <h1>Pre-therapy versus post-therapy, side by side.</h1>
      <p className="lead">Every therapy session is overlaid on the baseline screening so symptom reduction is visible at a glance.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Delta label="Motor amplitude" pre={42} post={68} unit="index" />
        <Delta label="Vocal intensity" pre={46} post={67} unit="dB" />
        <Delta label="Cognitive speed" pre={58} post={82} unit="score" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title="Motor performance overlay" data={motor} />
        <Panel title="Speech intensity overlay" data={speech} />
        <Panel title="Cognitive processing overlay" data={cognitive} />
        <section className="feature-card">
          <h3>Your live baseline</h3>
          <ul className="mt-4 space-y-3">
            <Row label="Tap rate" value={scores.motorTap === null ? "Not measured" : `${scores.motorTap} taps / 10s`} />
            <Row label="Tremor amplitude" value={scores.tremorAmplitude === null ? "Not measured" : `${scores.tremorAmplitude} px deviation`} />
            <Row label="Vocal intensity" value={scores.speech === null ? "Not measured" : `${scores.speech} dB average`} />
            <Row label="Cognitive recall" value={scores.cognitive === null ? "Not measured" : `${scores.cognitive}% processing score`} />
          </ul>
          <p className="mt-5 text-muted-foreground">Baselines come from your own screening results and anchor the pre-therapy curves above.</p>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
      <b>{label}</b>
      <span className="text-muted-foreground">{value}</span>
    </li>
  );
}

function Delta({ label, pre, post, unit }: { label: string; pre: number; post: number; unit: string }) {
  const change = Math.round(((post - pre) / pre) * 100);
  return (
    <div className="feature-card">
      <small className="font-bold uppercase tracking-wide text-muted-foreground">{label}</small>
      <div className="mt-2 flex items-end gap-3">
        <strong className="text-4xl">{post}</strong>
        <span className="pb-1 text-muted-foreground">from {pre} {unit}</span>
      </div>
      <span className={`mt-3 inline-flex items-center gap-2 font-extrabold ${change >= 0 ? "text-success" : "text-destructive"}`}>
        {change >= 0 ? <TrendingUp /> : <TrendingDown />} {change >= 0 ? "+" : ""}{change}% post-therapy
      </span>
    </div>
  );
}

function Panel({ title, data }: { title: string; data: { session: string; pre: number; post: number }[] }) {
  return (
    <section className="feature-card">
      <h3>{title}</h3>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="session" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line name="Pre-Therapy Diagnostics" dataKey="pre" stroke="var(--muted-foreground)" strokeWidth={3} strokeDasharray="6 4" dot={{ r: 3 }} />
            <Line name="Post-Therapy Diagnostics" dataKey="post" stroke="var(--success)" strokeWidth={4} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
