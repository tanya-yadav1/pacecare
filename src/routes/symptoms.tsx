import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, FilePlus2, Mic, SkipForward, Volume2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { speakInstructions } from "@/lib/speech";

export const Route = createFileRoute("/symptoms")({
  head: () => ({ meta: [
    { title: "PACE Check — A Movement Snapshot" }, { name: "description", content: "A short, non-diagnostic snapshot of walking, hands, voice, mobility, and how you feel." },
    { property: "og:title", content: "PACE Check" }, { property: "og:description", content: "A simple snapshot of your movement." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Symptoms,
});

const checks = [
  { name: "Walking", description: "Think about your pace, step length, turning, and confidence while walking." },
  { name: "Hands", description: "Think about buttons, utensils, writing, shaking, and small finger movements." },
  { name: "Voice", description: "Think about your voice volume and clarity, and whether others ask you to repeat yourself." },
  { name: "Mobility", description: "Think about stiffness, balance, standing up, and moving through daily activities." },
  { name: "How I Feel", description: "Think about your energy, sleep, mood, and how movement felt this week." },
] as const;
const descriptions = Object.fromEntries(checks.map((item) => [item.name, item.description]));

function Symptoms() {
  const { addObservation, observations, reportObservationIds, setReportObservationIds } = useLumaStrideWellness();
  const [category, setCategory] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<"idle" | "speaking" | "error">("idle");
  const [speechError, setSpeechError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const save = () => { if (!category || !answer) return; const id = addObservation({ category, note: `${category}: ${answer}`, value: answer }); setSavedId(id); setSaved(true); };
  const speak = async () => {
    if (!category || speechStatus === "speaking") return;
    setSpeechStatus("speaking"); setSpeechError("");
    try { await speakInstructions(`${category}. ${descriptions[category]}`); setSpeechStatus("idle"); }
    catch (error) { setSpeechError(error instanceof Error ? error.message : "Spoken instructions are unavailable right now."); setSpeechStatus("error"); }
  };
  const previous = category ? observations.find((item) => item.category === category) : undefined;
  const comparison = !previous || !answer ? "Your first saved check will become your comparison point." : previous.value === answer ? "Similar to your previous check." : "Different from your previous check.";
  const addToReport = () => { if (savedId && !reportObservationIds.includes(savedId)) setReportObservationIds([...reportObservationIds, savedId]); };
  return <div className="simple-page wide"><Link to="/" className="simple-back"><ChevronLeft/>Home</Link>
    {!category ? <><p className="eyebrow">Check</p><h1>PACE Check</h1><p className="simple-lead">A simple snapshot of your movement.</p><div className="check-steps" aria-label="Five check areas">{checks.map((item, index) => <Button key={item.name} variant="outline" size="xl" onClick={() => setCategory(item.name)}><span><b>{index + 1}</b><strong>{item.name}</strong><small>{item.description}</small></span><ChevronRight/></Button>)}</div><p className="observation-note">These are app-based observations, not a diagnosis or neurological examination. Skip anything that does not feel safe.</p></> :
    <section className="guided-check"><p className="eyebrow">App-based observation</p><h1>{category}</h1><p className="simple-lead">{descriptions[category]}</p><Button variant="outline" size="xl" onClick={speak} disabled={speechStatus === "speaking"}><Volume2/>{speechStatus === "speaking" ? "Playing instructions…" : "Hear instructions"}</Button><p role="status" aria-live="polite">{speechStatus === "speaking" ? "Audio is playing. Check your device volume if you cannot hear it." : speechStatus === "error" ? speechError : ""}</p><div className="activity-question"><span>During the past week, how noticeable was this?</span><div className="feeling-grid">{["Not noticeable", "A little", "Quite noticeable"].map((item) => <Button key={item} size="xl" variant={answer === item ? "default" : "outline"} onClick={() => setAnswer(item)}>{item}</Button>)}</div></div>
      {category === "Walking" && <Button size="xl" variant="outline" asChild><Link to="/walk">Optional: check walking cadence</Link></Button>}
      {category === "Voice" && <Button size="xl" variant="outline" asChild><Link to="/vocal"><Mic/>Optional: voice activity</Link></Button>}
      <div className="activity-actions"><Button size="xl" variant="ghost" onClick={() => { setCategory(null); setAnswer(null); setSaved(false); setSavedId(null); }}><SkipForward/>Choose another</Button><Button size="xl" disabled={!answer || saved} onClick={save}>{saved ? <><Check/>Saved</> : "Save Check"}</Button></div>
      {saved && <div className="assessment-summary"><p className="eyebrow">Your PACE Snapshot</p><h2>{category}</h2><strong className="snapshot-value">{answer}</strong><p>{comparison}</p><p>Your response may be worth discussing with a healthcare professional. This is an app-based observation, not a medical diagnosis.</p><Button size="xl" variant={savedId && reportObservationIds.includes(savedId) ? "success" : "amber"} onClick={addToReport} disabled={!savedId || reportObservationIds.includes(savedId)}><FilePlus2/>{savedId && reportObservationIds.includes(savedId) ? "Added to Doctor Report" : "Add to Doctor Report"}</Button></div>}
    </section>}
  </div>;
}