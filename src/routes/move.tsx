import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Music2 } from "lucide-react";
import { useState } from "react";
import { ActivityGuide } from "@/components/vitamove/ActivityGuide";
import { Button } from "@/components/ui/button";
import { durations, goals, sessionSteps } from "@/lib/wellness-content";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";

export const Route = createFileRoute("/move")({ head: () => ({ meta: [
  { title: "Move & Exercise — PACE" }, { name: "description", content: "Choose a goal and begin a short, ability-appropriate wellness activity." },
  { property: "og:title", content: "Move & Exercise — PACE" }, { property: "og:description", content: "Simple movement sessions for the time you have today." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Move });

function Move() {
  const state = useLumaStrideWellness(); const [goal, setGoal] = useState(state.goals[0] ?? ""); const [minutes, setMinutes] = useState(state.availableMinutes); const [ready, setReady] = useState(false);
  if (ready && goal) return <div className="simple-page"><Link to="/move" onClick={() => setReady(false)} className="simple-back"><ChevronLeft/>Change session</Link><h1>Today’s {goal} Session — {minutes} minutes</h1><ActivityGuide category={goal} title={`${goal} practice`} purpose="A short wellness session can help you practice comfortable, confident movement." minutes={minutes} steps={sessionSteps(goal, minutes)} musicLabel={goal === "Walking" ? "Add Rhythm" : "Play Music"}/></div>;
  return <div className="simple-page wide"><Link to="/" className="simple-back"><ChevronLeft/>Home</Link><p className="eyebrow">Move & Exercise</p><h1>What would you like to work on?</h1><div className="choice-grid">{goals.map(({ name, Icon }) => <Button key={name} variant={goal === name ? "default" : "outline"} size="xl" onClick={() => setGoal(name)}><Icon/>{name}</Button>)}</div><h2 className="mt-10">How much time do you have?</h2><div className="duration-row">{durations.map((value) => <Button key={value} size="xl" variant={minutes === value ? "default" : "outline"} onClick={() => setMinutes(value)}>{value} min</Button>)}</div><div className="start-panel"><div><h2>Here’s a simple place to start.</h2><p>{goal || "Choose a goal"} · {minutes} minutes</p></div><Button size="xl" disabled={!goal} onClick={() => { state.setGoals([goal]); state.setAvailableMinutes(minutes); setReady(true); }}>Show My Session</Button></div><details className="advanced-rhythm"><summary><Music2/>Personalize Rhythm</summary><p>Rhythm is optional. Advanced settings are available inside the music tool.</p><Button variant="outline" asChild><Link to="/music">Open rhythm settings</Link></Button></details></div>;
}