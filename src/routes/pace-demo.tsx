import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileHeart, Footprints, Music2, Route as Journey, Scale } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/vitamove/Brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pace-demo")({
  head: () => ({ meta: [
    { title: "PACE Demo — Understand. Practice. Prepare." }, { name: "description", content: "A guided sample of the PACE senior-first Parkinson's companion." },
    { property: "og:title", content: "PACE Demo" }, { property: "og:description", content: "See the PACE journey in 60–90 seconds." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: PaceDemo,
});

const scenes = [
  { title: "Parkinson’s doesn’t stop between appointments.", text: "PACE helps turn everyday moments into useful, user-controlled information.", icon: Brand },
  { title: "PACE Check", text: "Sample app-based observation: Walking felt a little more difficult today.", icon: CheckCircle2 },
  { title: "What’s important to you?", text: "Sample choices: Walking + Balance", icon: Scale },
  { title: "My PACE", text: "Walking · 10 min\nGentle Yoga · 5 min\nBalance · 5 min", icon: Footprints },
  { title: "Add Music", text: "Choose music you enjoy. Play, pause, or stop whenever you like.", icon: Music2 },
  { title: "My Journey", text: "Sample note: Today I walked with my daughter.", icon: Journey },
  { title: "My PACE Report", text: "Bring app-based observations, activity history, and your questions to a healthcare conversation.", icon: FileHeart },
  { title: "PACE", text: "Understand. Practice. Prepare.", icon: Brand },
];

function PaceDemo() {
  const [scene, setScene] = useState(0); const item = scenes[scene] ?? scenes[0]; const Icon = item.icon;
  return <div className="demo-page"><p className="demo-label">PACE Demo · Sample data</p><div className="demo-stage">{Icon === Brand ? <Brand/> : <Icon aria-hidden/>}<h1>{item.title}</h1><p>{item.text}</p>{scene < scenes.length - 1 ? <Button size="xl" variant="amber" onClick={() => setScene(scene + 1)}>Continue <ArrowRight/></Button> : <Button size="xl" asChild><Link to="/">Open PACE</Link></Button>}<div className="demo-progress" aria-label={`Step ${scene + 1} of ${scenes.length}`}>{scenes.map((_, index) => <span key={index} className={index <= scene ? "is-active" : ""}/>)}</div></div></div>;
}