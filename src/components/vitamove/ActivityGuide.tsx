import { useState } from "react";
import { Check, Music2, Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";

type ActivityGuideProps = {
  category: string;
  title: string;
  purpose: string;
  minutes: number;
  steps: { title: string; detail: string }[];
  musicLabel?: string | undefined;
};

export function ActivityGuide({ category, title, purpose, minutes, steps, musicLabel }: ActivityGuideProps) {
  const { addSession } = useLumaStrideWellness();
  const [stage, setStage] = useState<"ready" | "active" | "feeling" | "done">("ready");
  const [step, setStep] = useState(0);

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(stage === "active" ? `${steps[step]?.title}. ${steps[step]?.detail}` : `${title}. ${purpose}`));
  };

  const finish = (feeling: "Easy" | "About right" | "Difficult") => {
    addSession({ category, title, minutes, feeling });
    setStage("done");
  };

  return <section className="activity-guide" aria-live="polite">
    {stage === "ready" && <>
      <div className="activity-question"><span>What is this?</span><h2>{title}</h2><p>{steps.map((item) => item.title).join(" · ")}</p></div>
      <div className="activity-question"><span>Why might I do it?</span><p>{purpose}</p></div>
      <p className="safety-note"><strong>Move safely:</strong> Keep a sturdy support nearby. Stop if you feel pain, faint, dizzy, or short of breath.</p>
      <div className="activity-actions"><Button size="xl" variant="outline" onClick={speak}><Volume2/>Hear instructions</Button>{musicLabel&&<Button size="xl" variant="outline" asChild><a href="/music"><Music2/>{musicLabel}</a></Button>}<Button size="xl" onClick={() => setStage("active")}><Play/>Start</Button></div>
    </>}
    {stage === "active" && <>
      <p className="step-count">Step {step + 1} of {steps.length}</p>
      <h2>{steps[step]?.title}</h2><p className="simple-lead">{steps[step]?.detail}</p>
      <div className="activity-actions"><Button size="xl" variant="outline" onClick={speak}><Volume2/>Hear this step</Button><Button size="xl" onClick={() => step < steps.length - 1 ? setStep(step + 1) : setStage("feeling")}>{step < steps.length - 1 ? "Next" : <><Check/>Complete</>}</Button></div>
    </>}
    {stage === "feeling" && <><h2>How did it feel?</h2><div className="feeling-grid">{(["Easy", "About right", "Difficult"] as const).map((feeling) => <Button key={feeling} size="xl" variant="outline" onClick={() => finish(feeling)}>{feeling}</Button>)}</div></>}
    {stage === "done" && <div className="completion"><Check/><h2>Practice saved</h2><p>Your activity is now in My Progress.</p><Button size="xl" variant="outline" onClick={() => { setStep(0); setStage("ready"); }}><Pause/>Do it again</Button></div>}
  </section>;
}