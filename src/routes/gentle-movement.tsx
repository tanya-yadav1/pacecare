import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Hand, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActivityShell } from "@/components/pace/ActivityShell";
import { useActivityActions } from "@/lib/pace-activity";

export const Route = createFileRoute("/gentle-movement")({
  head: () => ({
    meta: [
      { title: "Gentle movement — PACE" },
      { name: "description", content: "Six seated stretches with spoken instructions, at your own pace." },
      { property: "og:title", content: "Gentle movement — PACE" },
      { property: "og:description", content: "Seated stretches you can do in a comfortable chair." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Movement,
});

const STEPS = [
  {
    emoji: "🪑",
    title: "Sit tall",
    text: "Sit back in your chair with both feet flat on the floor. Rest your hands on your knees and take one slow breath.",
  },
  {
    emoji: "🙆",
    title: "Shoulder rolls",
    text: "Lift both shoulders up toward your ears, then roll them slowly back and down. Repeat five times.",
  },
  {
    emoji: "🙌",
    title: "Reach up",
    text: "Raise one arm gently toward the ceiling, then lower it. Swap arms. Only reach as far as feels easy.",
  },
  {
    emoji: "👐",
    title: "Open your hands",
    text: "Spread your fingers wide, then close them into a soft fist. Repeat eight times.",
  },
  {
    emoji: "🦵",
    title: "Ankle circles",
    text: "Lift one foot a little off the floor and draw slow circles with your toes. Then the other foot.",
  },
  {
    emoji: "🌬️",
    title: "Finish softly",
    text: "Rest your hands in your lap, breathe in slowly, and breathe out even more slowly. You are finished.",
  },
];

function Movement() {
  const { status, announce, doHere } = useActivityActions("Gentle movement");
  const [step, setStep] = useState(0);
  const current = STEPS[step]!;

  useEffect(() => {
    announce(`${current.title}. ${current.text}`);
    // Speak each step as it appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <ActivityShell
      activity="Gentle movement"
      eyebrow="Explore"
      title="Seated stretches"
      lead="Move only as comfortable, and ask staff if unsure."
      status={status}
    >
      <section className="stretch-card">
        <p className="stretch-emoji" aria-hidden>
          {current.emoji}
        </p>
        <p className="eyebrow">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2>{current.title}</h2>
        <p className="stretch-text">{current.text}</p>
      </section>

      <div className="activity-actions">
        <Button size="xl" variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ArrowLeft aria-hidden />
          Back a step
        </Button>
        <Button size="xl" variant="outline" onClick={() => announce(`${current.title}. ${current.text}`)}>
          <Volume2 aria-hidden />
          Say it again
        </Button>
        {step < STEPS.length - 1 ? (
          <Button size="xl" onClick={() => setStep(step + 1)}>
            Next step
            <ArrowRight aria-hidden />
          </Button>
        ) : (
          <Button
            size="xl"
            onClick={() => doHere("Finished seated stretches", "Well done. You finished all six stretches.")}
          >
            <Hand aria-hidden />
            Finish stretches
          </Button>
        )}
      </div>
      <p className="observation-note">
        Gentle movement is for comfort and enjoyment. It is not exercise therapy or medical treatment.
      </p>
    </ActivityShell>
  );
}
