import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Coffee, MessageCircleHeart, Phone, Users, Video } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExperienceFeedback } from "@/components/pace/ExperienceFeedback";

export const Route = createFileRoute("/community")({ head: () => ({ meta: [
  { title: "Connect — PACE" }, { name: "description", content: "Choose a familiar person or a welcoming shared activity." },
  { property: "og:title", content: "Connect — PACE" }, { property: "og:description", content: "Simple, senior-controlled ways to connect." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Connect });

const connections = [
  { title: "Call Maya", detail: "Your daughter", Icon: Phone, action: "Calling Maya…" },
  { title: "Video with family", detail: "Family group", Icon: Video, action: "Opening your family video call…" },
  { title: "Garden listening circle", detail: "Today at 2:00", Icon: Users, action: "You’re interested in the garden listening circle." },
  { title: "Coffee & stories", detail: "Today at 3:30", Icon: Coffee, action: "You’re interested in coffee and stories." },
];

function Connect() {
  const [selected, setSelected] = useState<(typeof connections)[number] | null>(null);
  return <div className="simple-page wide"><Link to="/" className="simple-back"><ChevronLeft/>Home</Link><header className="simple-heading"><MessageCircleHeart className="simple-page-icon"/><div><p className="eyebrow">Connect</p><h1>Who would you like to be with?</h1><p>You are always in control of who PACE contacts.</p></div></header><div className="connection-grid">{connections.map((item) => <Button key={item.title} variant="outline" onClick={() => setSelected(item)}><item.Icon/><span><strong>{item.title}</strong><small>{item.detail}</small></span></Button>)}</div>{selected && <section className="connection-confirm" role="status"><selected.Icon/><div><p className="eyebrow">Your choice</p><h2>{selected.title}</h2><p>{selected.action}</p></div><Button size="xl" onClick={() => setSelected(null)}>Done</Button></section>}{selected && <ExperienceFeedback choice="Connect" title={selected.title}/>}</div>;
}