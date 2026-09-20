import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Brain, CalendarDays, FileHeart, LineChart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";

export const Route = createFileRoute("/")({
 head:()=>({meta:[{title:"Kindora — Understand. Practice. Prepare."},{name:"description",content:"Personalized assessments, movement activities, wellness practices, and progress tracking for people living with Parkinson's."},{property:"og:title",content:"Kindora — Understand. Practice. Prepare."},{property:"og:description",content:"Understand your movement, practice evidence-informed wellness activities, and prepare useful information for your healthcare team."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}), component: Home
});
function Home(){
 const { name } = useLumaStrideWellness();
  const actions = [
   { to: "/symptoms", label: "Check My Symptoms", Icon: Search, tone: "walk" },
   { to: "/move", label: "Move & Exercise", Icon: Activity, tone: "exercise" },
   { to: "/mind-body", label: "Mind & Body", Icon: Brain, tone: "relax" },
   { to: "/progress", label: "My Progress", Icon: LineChart, tone: "voice" },
 ] as const;
  return <section className="home-simple">
   <div className="home-intro"><p>Good morning, {name}</p><h1>Kindora</h1><h2>Understand. Practice. Prepare.</h2><p>Personalized assessments, movement activities, wellness practices and progress tracking designed to support people living with Parkinson’s.</p></div><h2 className="home-question">What would you like to do?</h2>
  <div className="home-actions">{actions.map(({to,label,Icon,tone})=><Link key={to} to={to} className={`home-action home-action-${tone}`}><Icon aria-hidden/><span>{label}</span></Link>)}</div>
   <div className="home-secondary"><Button variant="outline" size="xl" asChild><Link to="/my-day"><CalendarDays/>My Day</Link></Button><Button variant="outline" size="xl" asChild><Link to="/treatment-info"><FileHeart/>Treatment Information</Link></Button></div><Button className="doctor-visit-button" size="xl" variant="amber" asChild><Link to="/doctor-visit"><FileHeart/>Prepare for My Doctor Visit</Link></Button>
 </section>;
}
