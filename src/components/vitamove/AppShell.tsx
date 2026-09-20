import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Home, Menu, MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "./Brand";
import { useVitaMove } from "@/lib/vitamove-state";
import { Button } from "@/components/ui/button";

const everyday = [["/walk","Walk"],["/therapy","Exercise"],["/vocal","Voice"],["/relax","Relax"],["/music","My Music"],["/progress","My Progress"]] as const;
const more = [["/screening","Screening"],["/assessment","Risk Screener"],["/remedies","Adaptive Plan"],["/overlay","Clinical Charts"],["/clinician","Clinician View"],["/community","Community"],["/dashboard","Daily Plan"],["/rewards","Rewards"]] as const;
export function AppShell({ children }: { children: React.ReactNode }) {
 const { parkerOpen, setParkerOpen, messages, sendToParker, banner, dismissBanner } = useVitaMove();
 const [mobile, setMobile] = useState(false); const [text, setText] = useState("");
 const path = useRouterState({ select: (s) => s.location.pathname });
  const quietPage = ["/", "/walk", "/music", "/relax", "/progress"].includes(path);
  return <div className="min-h-screen bg-background">
   <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-surface shadow-sm">
    <div className="bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground sm:text-sm">LumaStride supports wellness and does not replace professional medical care.</div>
    <div className="mx-auto flex min-h-20 max-w-screen-xl items-center gap-4 px-4 lg:px-7">
     <Link to="/" aria-label="LumaStride home"><Brand compact /></Link>
     <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main navigation"><Link to="/" className={`nav-link ${path==="/"?"nav-link-active":""}`}><Home/> Home</Link>{everyday.slice(0,4).map(([to,label])=><Link key={to} to={to} className={`nav-link ${path===to?"nav-link-active":""}`}>{label}</Link>)}<details className="more-menu"><summary>More <ChevronDown/></summary><div>{[...everyday.slice(4),...more].map(([to,label])=><Link key={to} to={to} className={path===to?"nav-link-active":""}>{label}</Link>)}</div></details></nav>
     <div className="ml-auto lg:hidden"><Button variant="outline" size="iconLg" onClick={()=>setMobile(!mobile)} aria-label="Open navigation">{mobile?<X/>:<Menu/>}</Button></div>
   </div>
    {mobile&&<nav className="mobile-simple-nav" aria-label="Mobile navigation">{[["/","Home"],...everyday,...more].map(([to,label])=><Link key={to} to={to} onClick={()=>setMobile(false)} className={path===to?"nav-link-active":""}>{label}</Link>)}</nav>}
  </header>
   <main className="pt-28 sm:pt-32">{children}</main>
  {banner&&<div role="status" className="celebration"><span>{banner}</span><Button variant="ghostOnDark" size="icon" onClick={dismissBanner} aria-label="Dismiss notification"><X/></Button></div>}
   {!quietPage&&<div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
   {parkerOpen&&<section className="chat-panel" aria-label="Parker wellness assistant"><div className="flex items-center justify-between border-b p-4"><div><b>Parker</b><div className="text-sm text-success">● Ready to help</div></div><Button variant="ghost" size="icon" onClick={()=>setParkerOpen(false)} aria-label="Close Parker"><X/></Button></div><div className="max-h-72 space-y-3 overflow-y-auto p-4">{messages.map(m=><div key={m.id} className={m.from==="parker"?"chat-parker":"chat-user"}>{m.text}</div>)}</div><form className="flex gap-2 border-t p-3" onSubmit={e=>{e.preventDefault(); if(text.trim()){sendToParker(text.trim());setText("")}}}><input value={text} onChange={e=>setText(e.target.value)} className="min-w-0 flex-1 rounded-md border-2 border-input px-3" aria-label="Ask Parker" placeholder="Ask about tremors..."/><Button size="icon" aria-label="Send message"><Send/></Button></form></section>}
   <Button size="parker" onClick={()=>setParkerOpen(!parkerOpen)} aria-label="Open Parker assistant"><Brand compact={true}/><MessageCircle className="absolute -right-1 -top-1 rounded-full bg-accent p-1 text-accent-foreground"/></Button>
   </div>}
 </div>;
}
