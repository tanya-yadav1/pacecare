import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Mic, Share2, SkipForward, Volume2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { symptomCategories } from "@/lib/wellness-content";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";

export const Route = createFileRoute("/symptoms")({
  head: () => ({ meta: [
    { title: "Check My Symptoms — Kindora" }, { name: "description", content: "Short, non-diagnostic self-assessments and app-based movement observations." },
    { property: "og:title", content: "Check My Symptoms — Kindora" }, { property: "og:description", content: "Short self-assessments to help prepare for a healthcare conversation." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Symptoms,
});

const descriptions: Record<string, string> = {
  Tremor: "Notice any shaking while your hands are resting or moving.", "Movement speed": "Think about whether everyday movements feel slower than usual.", Stiffness: "Notice tightness or reduced ease of movement.", Walking: "Think about pace, step length, and confidence while walking.", Balance: "Consider steadiness during standing and everyday movement.", Turning: "Notice whether turning takes extra steps or feels less steady.", Freezing: "Notice moments when your feet feel briefly difficult to move.", "Hand coordination": "Think about buttons, utensils, writing, and other hand tasks.", Dexterity: "Notice speed and accuracy during small finger movements.", "Voice and speech": "Consider volume, clarity, and whether others ask you to repeat yourself.", "Facial movement": "Notice changes in expression or blinking reported by you or others.", "Daily activities": "Think about dressing, cooking, bathing, and household activities.", Sleep: "Consider sleep quality, vivid dreams, or daytime sleepiness.", Fatigue: "Notice how often low energy affects your day.", Mood: "Consider recent sadness, worry, loss of interest, or irritability.",
};

function Symptoms() {
  const { addObservation } = useLumaStrideWellness();
  const [category, setCategory] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const save = () => { if (!category || !answer) return; addObservation({ category, note: `${category}: ${answer}`, value: answer }); setSaved(true); };
  const share = async () => { const text = `${category ?? "Movement"} app-based observation: ${answer ?? "not completed"}. This is not a medical diagnosis.`; if (navigator.share) await navigator.share({ title: "Kindora observation", text }); else await navigator.clipboard?.writeText(text); };
  const speak = () => { if (!category || !("speechSynthesis" in window)) return; window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${category}. ${descriptions[category]}`)); };
  return <div className="simple-page wide"><Link to="/" className="simple-back"><ChevronLeft/>Home</Link>
    {!category ? <><p className="eyebrow">Guided self-assessment</p><h1>What would you like to check?</h1><p className="simple-lead">Choose one. Each check is short, and you can skip anything you cannot safely do.</p><div className="choice-grid">{symptomCategories.map((item) => <Button key={item} variant="outline" size="xl" onClick={() => setCategory(item)}>{item}<ChevronRight/></Button>)}</div><p className="observation-note">These are app-based observations, not a medical diagnosis or neurological examination.</p></> :
    <section className="guided-check"><p className="eyebrow">App-based observation</p><h1>{category}</h1><p className="simple-lead">{descriptions[category]}</p><Button variant="outline" size="xl" onClick={speak}><Volume2/>Hear instructions</Button><div className="activity-question"><span>During the past week, how noticeable was this?</span><div className="feeling-grid">{["Not noticeable", "A little", "Quite noticeable"].map((item) => <Button key={item} size="xl" variant={answer === item ? "default" : "outline"} onClick={() => setAnswer(item)}>{item}</Button>)}</div></div>
      {category === "Walking" && <Button size="xl" variant="outline" asChild><Link to="/walk">Optional: check walking cadence</Link></Button>}
      {category === "Voice and speech" && <Button size="xl" variant="outline" asChild><Link to="/vocal"><Mic/>Optional: voice activity</Link></Button>}
      <div className="activity-actions"><Button size="xl" variant="ghost" onClick={() => { setCategory(null); setAnswer(null); }}><SkipForward/>Skip</Button><Button size="xl" disabled={!answer || saved} onClick={save}>{saved ? <><Check/>Saved</> : "Save Assessment"}</Button><Button size="xl" variant="outline" onClick={share}><Share2/>Share with My Doctor</Button></div>
      {saved && <div className="assessment-summary"><h2>Thank you.</h2><p>Your responses show movement changes that may be worth discussing with a healthcare professional.</p><p>This saved item is an app-based observation. It is not a medical diagnosis.</p></div>}
    </section>}
  </div>;
}