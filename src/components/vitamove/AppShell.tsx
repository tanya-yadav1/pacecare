import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, ChevronDown, CircleHelp, FileHeart, Home, Menu, Send, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "./Brand";
import { useVitaMove } from "@/lib/vitamove-state";
import { Button } from "@/components/ui/button";

const everyday = [["/symptoms","Check Symptoms"],["/move","Move & Exercise"],["/mind-body","Mind & Body"],["/progress","My Progress"]] as const;
const more = [["/my-day","My Day"],["/doctor-visit","Doctor Visit"],["/treatment-info","Treatment Information"],["/screening","Advanced Observations"],["/music","Music Settings"],["/community","Community"]] as const;
const parentSection: Record<string, string> = {
  "/assessment": "/symptoms", "/walk": "/symptoms", "/overlay": "/screening", "/clinician": "/doctor-visit",
  "/dashboard": "/move", "/remedies": "/move", "/therapy": "/move", "/rewards": "/community",
  "/relax": "/mind-body", "/vocal": "/mind-body",
};
export function AppShell({ children }: { children: React.ReactNode }) {
  const { messages, sendToParker, banner, dismissBanner } = useVitaMove();
 const [mobile, setMobile] = useState(false); const [text, setText] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
 const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => path === to || parentSection[path] === to;
  const moreActive = [...everyday, ...more.slice(2)].some(([to]) => isActive(to));
  return <div className="min-h-screen bg-background">
   <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-surface shadow-sm">
     <div className="bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground sm:text-sm">PACE supports wellness and preparation. Diagnosis and treatment belong to qualified healthcare professionals.</div>
    <div className="mx-auto flex min-h-20 max-w-screen-xl items-center gap-4 px-4 lg:px-7">
      <Link to="/" aria-label="PACE home"><Brand compact /></Link>
       <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="PACE main navigation"><Link to="/" aria-current={isActive("/") ? "page" : undefined} className={`nav-link ${isActive("/")?"nav-link-active":""}`}><Home/> Home</Link><Link to="/my-day" aria-current={isActive("/my-day") ? "page" : undefined} className={`nav-link ${isActive("/my-day")?"nav-link-active":""}`}><CalendarDays/>My Day</Link><Link to="/doctor-visit" aria-current={isActive("/doctor-visit") ? "page" : undefined} className={`nav-link ${isActive("/doctor-visit")?"nav-link-active":""}`}><FileHeart/>Doctor Visit</Link><details className={`more-menu ${moreActive ? "nav-link-active" : ""}`}><summary aria-current={moreActive ? "page" : undefined}>More <ChevronDown/></summary><div>{[...everyday,...more.slice(2)].map(([to,label])=><Link key={to} to={to} aria-current={isActive(to) ? "page" : undefined} className={isActive(to)?"nav-link-active":""}>{label}</Link>)}</div></details></nav>
     <div className="ml-auto lg:hidden"><Button variant="outline" size="iconLg" onClick={()=>setMobile(!mobile)} aria-label="Open navigation">{mobile?<X/>:<Menu/>}</Button></div>
   </div>
     {mobile&&<nav className="mobile-simple-nav" aria-label="PACE mobile navigation">{[["/","Home"],...everyday,...more].map(([to,label])=><Link key={to} to={to} onClick={()=>setMobile(false)} aria-current={isActive(to) ? "page" : undefined} className={isActive(to)?"nav-link-active":""}>{label}</Link>)}</nav>}
  </header>
   <main className="pt-28 sm:pt-32">{children}</main>
   {banner&&<div role="status" className="celebration"><span>{banner}</span><Button variant="ghostOnDark" size="icon" onClick={dismissBanner} aria-label="Dismiss notification"><X/></Button></div>}
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
    {helpOpen&&<section className="help-panel" aria-label="Need help"><div className="flex items-center justify-between"><h2>Need Help?</h2><Button variant="ghost" size="icon" onClick={()=>setHelpOpen(false)} aria-label="Close help"><X/></Button></div><p><strong>Stop the activity now</strong> if you are falling, severely dizzy, have chest pain, severe shortness of breath, or sudden severe neurological symptoms.</p><p>Seek appropriate urgent medical attention. Call your local emergency number for an emergency.</p><div className="border-t pt-3"><b>Finding something in the app?</b><form className="mt-2 flex gap-2" onSubmit={e=>{e.preventDefault(); if(text.trim()){sendToParker(text.trim());setText("")}}}><input value={text} onChange={e=>setText(e.target.value)} className="min-w-0 flex-1 rounded-md border-2 border-input px-3" aria-label="Ask for app help" placeholder="What do you need?"/><Button size="iconLg" aria-label="Send question"><Send/></Button></form>{messages.slice(-1).map(m=><p key={m.id} className="chat-parker mt-2">{m.text}</p>)}</div></section>}
    <Button size="xl" variant="destructive" onClick={()=>setHelpOpen(!helpOpen)} aria-label="Open urgent and app help"><CircleHelp/>Need Help?</Button>
    </div>
 </div>;
}
