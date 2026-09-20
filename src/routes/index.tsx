import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Brain, CalendarDays, FileHeart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";

export const Route = createFileRoute("/")({
 head:()=>({meta:[{title:"PACE — Understand. Practice. Prepare."},{name:"description",content:"Personalized assessments, movement activities, wellness practices, and progress tracking for people living with Parkinson's."},{property:"og:title",content:"PACE — Understand. Practice. Prepare."},{property:"og:description",content:"Understand your movement, practice evidence-informed wellness activities, and prepare useful information for your healthcare team."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}), component: Home
});
function Home(){
 const { name } = useLumaStrideWellness();
  const actions = [
   { to: "/symptoms", label: "CHECK", detail: "Understand my movement", Icon: Search, tone: "walk" },
   { to: "/move", label: "MOVE", detail: "Practice movement", Icon: Activity, tone: "exercise" },
   { to: "/mind-body", label: "WELLNESS", detail: "Yoga, music & relaxation", Icon: Brain, tone: "relax" },
   { to: "/care", label: "CARE", detail: "My care & doctor visit", Icon: FileHeart, tone: "voice" },
 ] as const;
   return <section className="home-simple">
    <div className="home-intro"><p>Good morning, {name}</p><h1>What would you like to do today?</h1><p>PACE helps you understand, practice, track, and prepare—one simple step at a time.</p></div>
   <div className="home-actions">{actions.map(({to,label,detail,Icon,tone})=><Link key={to} to={to} className={`home-action home-action-${tone}`}><Icon aria-hidden/><span><strong>{label}</strong><small>{detail}</small></span></Link>)}</div>
    <section className="today-pace"><div><p className="eyebrow">Today’s PACE</p><h2>Your wellness plan</h2></div><ul><li>Walking <b>10 min</b></li><li>Gentle Yoga <b>5 min</b></li><li>Balance <b>5 min</b></li></ul><Button size="xl" variant="amber" asChild><Link to="/my-day"><CalendarDays/>Start Today</Link></Button></section>
 </section>;
}
