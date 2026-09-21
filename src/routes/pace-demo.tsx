import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, MessageCircleHeart, Mic, Music2, Users } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/vitamove/Brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pace-demo")({ head: () => ({ meta: [
  { title: "PACE Challenge Demo — Personalized Aging & Connection" }, { name: "description", content: "A 60-second sample of the PACE voice-to-connection journey." },
  { property: "og:title", content: "PACE Challenge Demo" }, { property: "og:description", content: "See how a senior's voice becomes a better next moment." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Demo });

const scenes = [
  { title: "Every senior deserves to be heard.", text: "PACE helps older adults show us what matters—one simple choice at a time.", icon: Brand },
  { title: "VOICE", text: "Eleanor says: “I want to do something with other people.”", icon: Mic },
  { title: "CHOICE", text: "PACE offers two clear choices: call Maya or join the garden listening circle.", icon: MessageCircleHeart },
  { title: "EXPERIENCE", text: "Eleanor chooses the garden circle and listens to familiar jazz with neighbors.", icon: Music2 },
  { title: "FEEDBACK → DISCOVERY", text: "Eleanor taps “Loved it.” PACE remembers music and the garden matter to her.", icon: Heart },
  { title: "CONNECTION", text: "Staff see a human insight—not a medical score—and plan another garden moment with residents who share that interest.", icon: Users },
  { title: "A better next moment.", text: "PACE · Personalized Aging & Connection Experience\nYour voice. Your choice. Your moment.", icon: Brand },
];

function Demo() { const [scene, setScene] = useState(0); const item = scenes[scene]; if (!item) return null; const Icon = item.icon; return <div className="demo-page"><p className="demo-label">Congressional App Challenge · Sample data</p><div className="demo-stage">{Icon === Brand ? <Brand/> : <Icon aria-hidden/>}<h1>{item.title}</h1><p>{item.text}</p>{scene < scenes.length - 1 ? <Button size="xl" variant="amber" onClick={() => setScene(scene + 1)}>Continue<ArrowRight/></Button> : <div className="activity-actions"><Button size="xl" asChild><Link to="/">Try Senior Mode</Link></Button><Button size="xl" variant="outline" asChild><Link to="/staff">See Staff Mode</Link></Button></div>}<div className="demo-progress" aria-label={`Step ${scene + 1} of ${scenes.length}`}>{scenes.map((_, index) => <span key={index} className={index <= scene ? "is-active" : ""}/>)}</div></div></div>; }