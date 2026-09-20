import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, AudioLines, ChevronLeft, Footprints, PersonStanding, Scale } from "lucide-react";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";

export const Route = createFileRoute("/progress")({ head: () => ({ meta: [
  { title: "My Progress — Kindora" }, { name: "description", content: "A simple view of your activity, practice, reported symptoms, and app-based observations." },
  { property: "og:title", content: "My Progress — Kindora" }, { property: "og:description", content: "Review your wellness practice and app-based observations over time." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Progress });

function Progress() {
  const { cadence, sessions, observations } = useLumaStrideWellness();
  const count = (term: string) => sessions.filter((session) => `${session.category} ${session.title}`.toLowerCase().includes(term)).length;
  const total = sessions.reduce((sum, session) => sum + session.minutes, 0);
  return <div className="simple-page wide"><Link to="/" className="simple-back"><ChevronLeft/>Home</Link><h1>My Progress</h1><p className="simple-lead">Your activity, practice, and reported symptoms—kept simple.</p><div className="progress-summary"><article><Activity/><strong>{sessions.length}</strong><span>Movement sessions</span></article><article><Footprints/><strong>{total}</strong><span>Exercise minutes</span></article><article><PersonStanding/><strong>{count("yoga")}</strong><span>Yoga sessions</span></article><article><AudioLines/><strong>{count("voice")}</strong><span>Voice sessions</span></article><article><Scale/><strong>{count("balance")}</strong><span>Balance practice</span></article></div><section className="history-section"><h2>App-based observations</h2><p>These measurements and reports are not a medical diagnosis.</p>{cadence && <article><Footprints/><div><strong>Walking cadence</strong><span>About {cadence} steps per minute</span></div></article>}{observations.length ? observations.map((item) => <article key={item.id}><Activity/><div><strong>{item.category}</strong><span>{item.note} · {new Date(item.date).toLocaleDateString()}</span></div></article>) : <p className="empty-state">No symptom observations saved yet.</p>}</section><section className="history-section"><h2>Recent practice</h2>{sessions.length ? sessions.map((session) => <article key={session.id}><Activity/><div><strong>{session.title} · {session.minutes} min</strong><span>{new Date(session.date).toLocaleDateString()} · Felt {session.feeling.toLowerCase()}</span></div></article>) : <p className="empty-state">Complete an activity to see it here.</p>}</section></div>;
}