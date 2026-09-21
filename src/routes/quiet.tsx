import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Pause, Play, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExperienceFeedback } from "@/components/pace/ExperienceFeedback";

export const Route = createFileRoute("/quiet")({
  head: () => ({
    meta: [
      { title: "Relax — PACE" },
      { name: "description", content: "A simple guided breathing pause." },
      { property: "og:title", content: "Relax — PACE" },
      { property: "og:description", content: "A simple guided breathing pause." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Relax,
});

function Relax() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(60);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(
      () => setSeconds((value) => (value <= 1 ? (setRunning(false), 60) : value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [running]);
  const phase = seconds % 10 > 5 ? "Breathe out slowly" : "Breathe in gently";
  return (
    <div className="simple-page">
      <Link to="/" className="simple-back">
        <ChevronLeft /> Home
      </Link>
      <section className="simple-center">
        <p className="eyebrow">Quiet</p>
        <Wind className="simple-page-icon" />
        <h1>Take a quiet minute.</h1>
        <p className="simple-lead">Nothing else is expected of you right now.</p>
        <div className={`breathing-circle ${running ? "is-breathing" : ""}`}>
          <strong>{running ? phase : "Ready"}</strong>
          <span>{seconds} seconds</span>
        </div>
        <Button size="xl" variant="amber" onClick={() => setRunning(!running)}>
          {running ? (
            <>
              <Pause />
              Pause
            </>
          ) : (
            <>
              <Play />
              Begin
            </>
          )}
        </Button>
      </section>
      <ExperienceFeedback choice="Quiet" title="A quiet minute" />
    </div>
  );
}
