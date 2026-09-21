import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, Wind } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActivityShell } from "@/components/pace/ActivityShell";
import { useActivityActions, sayAloud } from "@/lib/pace-activity";
import { playChime } from "@/lib/ambient-sounds";

export const Route = createFileRoute("/breathing")({
  head: () => ({
    meta: [
      { title: "Guided breathing — PACE" },
      { name: "description", content: "A slow breathing circle with gentle spoken cues." },
      { property: "og:title", content: "Guided breathing — PACE" },
      { property: "og:description", content: "Breathe along with a slowly growing circle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Breathing,
});

const LENGTHS = [2, 5, 10];
const PHASE = 5; // seconds in and out

function Breathing() {
  const { status, announce, doHere } = useActivityActions("Guided breathing");
  const [minutes, setMinutes] = useState(2);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(120);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const spoken = useRef<string>("");

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          setRunning(false);
          void playChime();
          doHere("Finished guided breathing", "That is the end of your breathing time. Well done.");
          return minutes * 60;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, minutes, doHere]);

  useEffect(() => {
    if (!running) return;
    const elapsed = minutes * 60 - left;
    const next = Math.floor(elapsed / PHASE) % 2 === 0 ? "in" : "out";
    setPhase(next);
    const cue = next === "in" ? "Breathe in" : "Breathe out";
    if (spoken.current !== `${cue}-${Math.floor(elapsed / PHASE)}`) {
      spoken.current = `${cue}-${Math.floor(elapsed / PHASE)}`;
      sayAloud(cue);
    }
  }, [left, running, minutes]);

  const startStop = () => {
    if (running) {
      setRunning(false);
      announce("Paused. Start again whenever you are ready.");
      return;
    }
    setLeft(minutes * 60);
    setRunning(true);
    announce(`Let's breathe together for ${minutes} minutes.`);
  };

  return (
    <ActivityShell
      activity="Guided breathing"
      eyebrow="Quiet"
      title="Breathe with me"
      lead="Follow the circle. Breathe in as it grows, out as it shrinks."
      status={status}
    >
      <div className="activity-actions" role="group" aria-label="How long">
        {LENGTHS.map((length) => (
          <Button
            key={length}
            size="xl"
            variant={minutes === length ? "default" : "outline"}
            aria-pressed={minutes === length}
            onClick={() => {
              setMinutes(length);
              setLeft(length * 60);
              announce(`${length} minutes.`);
            }}
          >
            {length} minutes
          </Button>
        ))}
      </div>

      <div className={`breathing-circle big${running ? ` is-breathing phase-${phase}` : ""}`}>
        <Wind aria-hidden />
        <strong>{running ? (phase === "in" ? "Breathe in…" : "Breathe out…") : "Ready"}</strong>
        <span>
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")} left
        </span>
      </div>

      <div className="activity-actions">
        <Button size="xl" variant="amber" onClick={startStop}>
          {running ? <Pause aria-hidden /> : <Play aria-hidden />}
          {running ? "Pause" : "Begin breathing"}
        </Button>
      </div>
    </ActivityShell>
  );
}
