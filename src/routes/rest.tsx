import { createFileRoute } from "@tanstack/react-router";
import { Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActivityShell } from "@/components/pace/ActivityShell";
import { useActivityActions } from "@/lib/pace-activity";
import { playChime } from "@/lib/ambient-sounds";

export const Route = createFileRoute("/rest")({
  head: () => ({
    meta: [
      { title: "Rest — PACE" },
      { name: "description", content: "A dimmed screen with a large clock for a quiet rest." },
      { property: "og:title", content: "Rest — PACE" },
      { property: "og:description", content: "Rest quietly with a soft screen and a gentle end sound." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Rest,
});

const LENGTHS = [2, 5, 10];

function Rest() {
  const { status, announce, doHere } = useActivityActions("Rest");
  const [minutes, setMinutes] = useState(5);
  const [resting, setResting] = useState(false);
  const [left, setLeft] = useState(300);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    if (!resting) return;
    const timer = window.setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          setResting(false);
          void playChime();
          doHere("Rested quietly", "Your rest is over. Take your time getting up.");
          return minutes * 60;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resting, minutes, doHere]);

  return (
    <ActivityShell
      activity="Rest"
      eyebrow="Quiet"
      title="Rest a while"
      lead="The screen will dim. A soft sound will tell you when your rest is over."
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

      <section className={`rest-screen${resting ? " is-dim" : ""}`}>
        <Moon aria-hidden />
        <p className="rest-clock">{now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
        {resting && (
          <p className="rest-left">
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")} of quiet left
          </p>
        )}
      </section>

      <div className="activity-actions">
        <Button
          size="xl"
          variant="amber"
          onClick={() => {
            if (resting) {
              setResting(false);
              announce("Rest stopped.");
              return;
            }
            setLeft(minutes * 60);
            setResting(true);
            announce(`Resting for ${minutes} minutes. Close your eyes if you like.`);
          }}
        >
          {resting ? "Stop resting" : "Begin resting"}
        </Button>
      </div>
    </ActivityShell>
  );
}
