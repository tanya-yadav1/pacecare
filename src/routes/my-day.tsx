import { createFileRoute, Link } from "@tanstack/react-router";
import { AudioLines, ChevronLeft, Footprints, Heart, PersonStanding } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { durations } from "@/lib/wellness-content";

const helpChoices = ["Walking", "Balance", "Tremor", "Stiffness", "Exercise", "Voice", "Wellness"];
const enjoyChoices = ["Walking", "Yoga", "Dance", "Music", "Stretching", "Tai Chi", "Other"];

export const Route = createFileRoute("/my-day")({ head: () => ({ meta: [
  { title: "My Day — Kindora" }, { name: "description", content: "A small, personalized wellness plan for today." },
  { property: "og:title", content: "My Day — Kindora" }, { property: "og:description", content: "A few simple activities based on your goals and available time." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: MyDay });

function MyDay() {
  const state = useLumaStrideWellness();
  const { goals, preferredActivities, availableMinutes, sessions } = state;
  if (!goals.length || !preferredActivities.length) return <div className="simple-page wide"><Link to="/" className="simple-back"><ChevronLeft/>Home</Link><p className="eyebrow">My Day</p><h1>Let’s find a simple place to start.</h1><section className="quick-setup"><h2>What would you like help with?</h2><div className="duration-row">{helpChoices.map((item) => <Button key={item} size="xl" variant={goals.includes(item) ? "default" : "outline"} onClick={() => state.setGoals(goals.includes(item) ? goals.filter((goal) => goal !== item) : [...goals, item])}>{item}</Button>)}</div><h2>What activities do you enjoy?</h2><div className="duration-row">{enjoyChoices.map((item) => <Button key={item} size="xl" variant={preferredActivities.includes(item) ? "default" : "outline"} onClick={() => state.setPreferredActivities(preferredActivities.includes(item) ? preferredActivities.filter((activity) => activity !== item) : [...preferredActivities, item])}>{item}</Button>)}</div><h2>How much time do you have today?</h2><div className="duration-row">{durations.map((value) => <Button key={value} size="xl" variant={availableMinutes === value ? "default" : "outline"} onClick={() => state.setAvailableMinutes(value)}>{value} min</Button>)}</div><p className="simple-note">Choose at least one goal and one activity. Your choices save automatically.</p></section></div>;
  const difficult = sessions.find((session) => session.feeling === "Difficult");
  const firstGoal = goals[0] ?? "Walking";
  const preferred = preferredActivities[0] ?? "Gentle Yoga";
  const plan = [
    { Icon: Footprints, title: firstGoal, minutes: Math.min(10, availableMinutes), to: "/move" as const },
    { Icon: PersonStanding, title: preferred, minutes: 5, to: "/mind-body" as const },
    { Icon: AudioLines, title: "Voice Practice", minutes: 5, to: "/vocal" as const },
    { Icon: Heart, title: "Relaxation", minutes: 5, to: "/mind-body" as const },
  ].slice(0, availableMinutes <= 10 ? 2 : availableMinutes <= 20 ? 3 : 4);
  return <div className="simple-page"><Link to="/" className="simple-back"><ChevronLeft/>Home</Link><p className="eyebrow">Today</p><h1>Your wellness plan</h1><p className="simple-lead">A few activities based on what matters to you and the time you have.</p>{difficult && <p className="simple-note">Your last {difficult.category.toLowerCase()} session felt difficult, so today’s plan keeps things short and gentle.</p>}<div className="day-list">{plan.map(({ Icon, title, minutes, to }) => <Link key={title} to={to}><Icon/><span><strong>{minutes} min {title}</strong><small>Open activity</small></span></Link>)}</div><p className="observation-note">This is your wellness plan, not a medical treatment plan. Choose only activities that feel safe today.</p><Button size="xl" variant="outline" asChild><Link to="/move">Change goals or time</Link></Button></div>;
}