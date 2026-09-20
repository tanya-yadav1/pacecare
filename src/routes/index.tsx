import { createFileRoute, Link } from "@tanstack/react-router";
import { Dumbbell, Footprints, LineChart, Music2, Smile, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";

export const Route = createFileRoute("/")({
 head:()=>({meta:[{title:"LumaStride — Simple Daily Wellness Support"},{name:"description",content:"Simple movement, voice, music, and relaxation support for people living with Parkinson's."},{property:"og:title",content:"LumaStride — Simple Daily Wellness Support"},{property:"og:description",content:"Simple movement, voice, music, and relaxation support for people living with Parkinson's."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}), component: Home
});
function Home(){
 const { name } = useLumaStrideWellness();
 const actions = [
  { to: "/walk", label: "Walk with Music", Icon: Footprints, tone: "walk" },
  { to: "/therapy", label: "Exercise", Icon: Dumbbell, tone: "exercise" },
  { to: "/vocal", label: "Voice & Sing", Icon: Music2, tone: "voice" },
  { to: "/relax", label: "Relax", Icon: Wind, tone: "relax" },
 ] as const;
 return <section className="home-simple">
  <div className="home-welcome"><Smile aria-hidden/><div><h1>Good morning, {name}</h1><p>What would you like to do?</p></div></div>
  <div className="home-actions">{actions.map(({to,label,Icon,tone})=><Link key={to} to={to} className={`home-action home-action-${tone}`}><Icon aria-hidden/><span>{label}</span></Link>)}</div>
  <div className="home-secondary"><Button variant="outline" size="xl" asChild><Link to="/music"><Music2/> My Music</Link></Button><Button variant="outline" size="xl" asChild><Link to="/progress"><LineChart/> My Progress</Link></Button></div>
 </section>;
}
