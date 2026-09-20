import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Footprints, Grip, PersonStanding, Scale, SkipForward } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { durations } from "@/lib/wellness-content";

const helpChoices = ["Walking", "Balance", "Strength", "Flexibility", "Posture", "Hands", "Voice", "Independence", "Relaxation"];
const enjoyChoices = ["Walking", "Yoga", "Dance", "Stretching", "Tai Chi", "Music"];

export const Route = createFileRoute("/my-day")({ head: () => ({ meta: [
  { title: "My PACE — Today's Wellness Plan" }, { name: "description", content: "An optional, editable wellness plan based on what matters to you." },
  { property: "og:title", content: "My PACE" }, { property: "og:description", content: "Walking, gentle yoga, and balance in one simple plan." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: MyDay });

function MyDay() {
  const state = useLumaStrideWellness();
  const [skipped, setSkipped] = useState<string[]>([]);
  const { goals, preferredActivities, availableMinutes, sessions } = state;
  if (!goals.length || !preferredActivities.length) return <div className="simple-page wide"><Link to="/" className="simple-back"><ChevronLeft/>Home</Link><p className="eyebrow">Personalize</p><h1>What matters most to you?</h1><section className="quick-setup"><p className="simple-lead">Choose as many as you like.</p><div className="duration-row">{helpChoices.map((item) => <Button key={item} size="xl" variant={goals.includes(item) ? "default" : "outline"} onClick={() => state.setGoals(goals.includes(item) ? goals.filter((goal) => goal !== item) : [...goals, item])} aria-pressed={goals.includes(item)}>{item}</Button>)}</div><h2>What activities do you enjoy?</h2><div className="duration-row">{enjoyChoices.map((item) => <Button key={item} size="xl" variant={preferredActivities.includes(item) ? "default" : "outline"} onClick={() => state.setPreferredActivities(preferredActivities.includes(item) ? preferredActivities.filter((activity) => activity !== item) : [...preferredActivities, item])} aria-pressed={preferredActivities.includes(item)}>{item}</Button>)}</div><h2>How much time do you have today?</h2><div className="duration-row">{durations.map((value) => <Button key={value} size="xl" variant={availableMinutes === value ? "default" : "outline"} onClick={() => state.setAvailableMinutes(value)}>{value} min</Button>)}</div><p className="simple-note">Choose at least one goal and one activity. Your choices save automatically.</p></section></div>;
  const difficult = sessions.find((session) => session.feeling === "Difficult");
  const plan = [
    { Icon: Footprints, title: "Walking", minutes: 10, to: "/move" as const },
    { Icon: PersonStanding, title: "Gentle Yoga", minutes: 5, to: "/mind-body" as const },
    { Icon: Scale, title: "Balance", minutes: 5, to: "/move" as const },
    { Icon: Grip, title: "Hands", minutes: 5, to: "/move" as const },
  ].slice(0, availableMinutes <= 10 ? 1 : availableMinutes <= 20 ? 3 : 4).filter((item) => !skipped.includes(item.title));
  return <div className="simple-page"><Link to="/" className="simple-back"><ChevronLeft/>Home</Link><p className="eyebrow">Today</p><h1>My PACE</h1><p className="simple-lead">Your optional wellness plan. Start, edit, or skip anything.</p>{difficult && <p className="simple-note">Your last {difficult.category.toLowerCase()} session felt difficult, so today’s plan keeps things short and gentle.</p>}<div className="day-list">{plan.map(({ Icon, title, minutes, to }) => <article key={title}><Link to={to}><Icon/><span><strong>{minutes} min {title}</strong><small>Start activity</small></span></Link><Button size="iconLg" variant="ghost" aria-label={`Skip ${title}`} onClick={() => setSkipped([...skipped, title])}><SkipForward/></Button></article>)}</div>{!plan.length && <p className="empty-state">Everything is skipped for today. You can change your goals whenever you’re ready.</p>}<p className="observation-note">This is your wellness plan, not a medical treatment plan. Choose only activities that feel safe today.</p><Button size="xl" variant="outline" onClick={() => { state.setGoals([]); state.setPreferredActivities([]); }}>Edit goals and activities</Button></div>;
}