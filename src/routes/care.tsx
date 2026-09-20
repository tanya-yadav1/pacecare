import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, FileHeart, HeartHandshake, Pill, Target, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { personalGoals } from "@/lib/wellness-content";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";

export const Route = createFileRoute("/care")({
  head: () => ({ meta: [
    { title: "My Care — PACE" }, { name: "description", content: "Keep your goals, medications, care team, sharing choices, and PACE report together." },
    { property: "og:title", content: "My Care — PACE" }, { property: "og:description", content: "Your care information, controlled by you." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Care,
});

const memberTypes = ["Family", "Caregiver", "Doctor", "Physical Therapist", "Occupational Therapist", "Speech Therapist"];

function Care() {
  const state = useLumaStrideWellness(); const [medication, setMedication] = useState("");
  const toggle = (items: string[], item: string, save: (next: string[]) => void) => save(items.includes(item) ? items.filter((value) => value !== item) : [...items, item]);
  return <div className="simple-page wide"><Link to="/" className="simple-back"><ChevronLeft/>Home</Link><p className="eyebrow">Prepare</p><h1>My Care</h1><p className="simple-lead">Keep important information together. You decide what to save and share.</p><div className="care-grid"><section className="care-section"><Target/><div><h2>My Goals</h2><div className="duration-row">{personalGoals.map((goal) => <Button key={goal} size="lg" variant={state.goals.includes(goal) ? "default" : "outline"} onClick={() => toggle(state.goals, goal, state.setGoals)} aria-pressed={state.goals.includes(goal)}>{goal}</Button>)}</div></div></section><section className="care-section"><Pill/><div><h2>My Medications</h2><p>User-entered information only. PACE never recommends medication or dosage changes.</p><div className="entry-row"><Input value={medication} onChange={(event) => setMedication(event.target.value)} placeholder="Medication name"/><Button size="xl" onClick={() => { const clean = medication.trim(); if (clean) { state.setMedications([...state.medications, clean]); setMedication(""); } }}>Add</Button></div>{state.medications.map((item) => <p key={item} className="saved-line">{item}</p>)}</div></section><section className="care-section"><Users/><div><h2>My Care Team</h2><div className="duration-row">{memberTypes.map((member) => <Button key={member} size="lg" variant={state.careTeam.includes(member) ? "default" : "outline"} onClick={() => toggle(state.careTeam, member, state.setCareTeam)} aria-pressed={state.careTeam.includes(member)}>{member}</Button>)}</div></div></section><section className="care-section"><HeartHandshake/><div><h2>PACE Circle</h2><p>Choose exactly who may receive information you decide to share.</p><div className="duration-row">{memberTypes.map((member) => <Button key={member} size="lg" variant={state.circleSharing.includes(member) ? "default" : "outline"} onClick={() => toggle(state.circleSharing, member, state.setCircleSharing)} aria-pressed={state.circleSharing.includes(member)}>{member}</Button>)}</div></div></section><Link to="/doctor-visit" className="care-report"><FileHeart/><span><strong>My PACE Report</strong><small>Review, print, or share</small></span></Link></div><p className="report-disclaimer">Talk with your healthcare professional before changing medication. PACE does not diagnose or replace medical care.</p></div>;
}