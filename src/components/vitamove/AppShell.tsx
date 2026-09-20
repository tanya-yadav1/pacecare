import { Link, useRouterState } from "@tanstack/react-router";
import { Flame, Menu, MessageCircle, Send, Star, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "./Brand";
import { useVitaMove } from "@/lib/vitamove-state";
import { Button } from "@/components/ui/button";

const nav = [["/screening","Multi-Modal Screening"],["/remedies","Adaptive Remedies"],["/vocal","Vocal & Digital"],["/overlay","Clinical Data Overlay"],["/dashboard","Dashboard"],["/assessment","Screening Hub"],["/therapy","Movement Therapy"],["/rewards","Rewards"],["/clinician","Clinician View"],["/community","Community"]] as const;
export function AppShell({ children }: { children: React.ReactNode }) {
 const { stars, parkerOpen, setParkerOpen, messages, sendToParker, banner, dismissBanner } = useVitaMove();
 const [mobile, setMobile] = useState(false); const [text, setText] = useState("");
 const path = useRouterState({ select: (s) => s.location.pathname });
 return <div className="min-h-screen bg-background">
  <header className="fixed inset-x-0 top-0 z-40 border-b-2 border-primary bg-surface shadow-lg">
   <div className="bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground">Disclaimer: VitaMove is a supportive wellness tool. It does not replace professional medical care.</div>
   <div className="mx-auto flex min-h-20 max-w-screen-2xl items-center gap-4 px-4 lg:px-7">
    <Link to="/" aria-label="VitaMove home"><Brand compact /></Link>
    <nav className="ml-auto hidden flex-wrap items-center justify-end gap-x-1 gap-y-1 xl:flex" aria-label="Main navigation">{nav.map(([to,label])=><Link key={to} to={to} className={`nav-link ${path===to?"nav-link-active":""}`}>{label}</Link>)}</nav>
    <div className="ml-auto flex items-center gap-2 xl:ml-4"><div className="stat-pill"><Flame className="text-destructive" aria-hidden/><span><b>7-Day</b><small>Streak</small></span></div><div className="stat-pill"><Star className="fill-accent text-accent-foreground" aria-hidden/><span><b>{stars}</b><small>Wellness Stars</small></span></div><Button variant="outline" size="iconLg" className="xl:hidden" onClick={()=>setMobile(!mobile)} aria-label="Open navigation"><Menu/></Button></div>
   </div>
   {mobile&&<nav className="grid grid-cols-2 gap-2 border-t bg-surface p-4 xl:hidden">{nav.map(([to,label])=><Link key={to} to={to} onClick={()=>setMobile(false)} className="nav-link">{label}</Link>)}</nav>}
  </header>
  <main className="pt-36 sm:pt-32">{children}</main>
  {banner&&<div role="status" className="celebration"><span>{banner}</span><Button variant="ghostOnDark" size="icon" onClick={dismissBanner} aria-label="Dismiss notification"><X/></Button></div>}
  <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
   {parkerOpen&&<section className="chat-panel" aria-label="Parker wellness assistant"><div className="flex items-center justify-between border-b p-4"><div><b>Parker</b><div className="text-sm text-success">● Ready to help</div></div><Button variant="ghost" size="icon" onClick={()=>setParkerOpen(false)} aria-label="Close Parker"><X/></Button></div><div className="max-h-72 space-y-3 overflow-y-auto p-4">{messages.map(m=><div key={m.id} className={m.from==="parker"?"chat-parker":"chat-user"}>{m.text}</div>)}</div><form className="flex gap-2 border-t p-3" onSubmit={e=>{e.preventDefault(); if(text.trim()){sendToParker(text.trim());setText("")}}}><input value={text} onChange={e=>setText(e.target.value)} className="min-w-0 flex-1 rounded-md border-2 border-input px-3" aria-label="Ask Parker" placeholder="Ask about tremors..."/><Button size="icon" aria-label="Send message"><Send/></Button></form></section>}
   <Button size="parker" onClick={()=>setParkerOpen(!parkerOpen)} aria-label="Open Parker assistant"><Brand compact={true}/><MessageCircle className="absolute -right-1 -top-1 rounded-full bg-accent p-1 text-accent-foreground"/></Button>
  </div>
 </div>;
}
