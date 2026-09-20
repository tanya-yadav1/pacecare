import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { ActivityGuide } from "@/components/vitamove/ActivityGuide";
import { Button } from "@/components/ui/button";
import { mindActivities } from "@/lib/wellness-content";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";

export const Route = createFileRoute("/mind-body")({ head: () => ({ meta: [
  { title: "Mind & Body — PACE" }, { name: "description", content: "Gentle yoga, tai chi, stretching, breathing, meditation, relaxation, dance, and optional music." },
  { property: "og:title", content: "Mind & Body — PACE" }, { property: "og:description", content: "Choose a gentle wellness activity that suits your ability." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: MindBody });

function MindBody() {
  const state = useLumaStrideWellness(); const [selected, setSelected] = useState<(typeof mindActivities)[number] | null>(null); const [option, setOption] = useState(""); const [start, setStart] = useState(false);
  if (selected && start) return <div className="simple-page"><Button variant="link" className="simple-back" onClick={() => setStart(false)}><ChevronLeft/>Change activity</Button><ActivityGuide category={selected.name} title={`${option || selected.options[0]} ${selected.name}`} purpose={selected.purpose} minutes={state.availableMinutes} steps={[{ title: "Settle in", detail: "Choose a stable, comfortable position and take two easy breaths." }, { title: "Practice", detail: `Continue the ${selected.name.toLowerCase()} movement gently and within a comfortable range.` }, { title: "Complete", detail: "Slow down, notice how you feel, and return to your usual position." }]} musicLabel={["Dance", "Relaxation", "Yoga"].includes(selected.name) ? "Add Music 🎵" : undefined}/></div>;
  return <div className="simple-page wide"><Link to="/" className="simple-back"><ChevronLeft/>Home</Link><p className="eyebrow">Wellness</p><h1>Choose what feels right today.</h1><p className="simple-lead">Yoga, tai chi, dance, stretching, breathing, meditation, relaxation, and optional music.</p><div className="activity-grid">{mindActivities.map((activity) => <Button key={activity.name} variant={selected?.name === activity.name ? "default" : "outline"} onClick={() => { setSelected(activity); setOption(activity.options[0]); }}><activity.Icon/><span><strong>{activity.name}</strong><small>{activity.purpose}</small></span></Button>)}</div>{selected && <section className="start-panel stacked"><p className="eyebrow">What</p><h2>{selected.name}</h2><p>{selected.purpose}</p><p className="eyebrow">Choose an option</p><div className="duration-row">{selected.options.map((item) => <Button key={item} variant={option === item ? "default" : "outline"} onClick={() => setOption(item)}>{item}</Button>)}</div><p className="safety-note"><strong>Choose a session appropriate for your ability.</strong> Use a stable chair or support when needed, and stop if you feel unwell.</p><Button size="xl" onClick={() => { state.setPreferredActivities([selected.name]); setStart(true); }}>Start</Button></section>}</div>;
}