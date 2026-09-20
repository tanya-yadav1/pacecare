import { createFileRoute, Link } from "@tanstack/react-router";
import { AudioLines, ChevronLeft, Footprints, Heart, PersonStanding } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";

export const Route = createFileRoute("/my-day")({ head: () => ({ meta: [
  { title: "My Day — Kindora" }, { name: "description", content: "A small, personalized wellness plan for today." },
  { property: "og:title", content: "My Day — Kindora" }, { property: "og:description", content: "A few simple activities based on your goals and available time." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: MyDay });

function MyDay() {
  const { goals, preferredActivities, availableMinutes, sessions } = useLumaStrideWellness();
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