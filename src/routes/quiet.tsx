import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bird, Moon, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExperienceFeedback } from "@/components/pace/ExperienceFeedback";
import { useActivityActions } from "@/lib/pace-activity";

export const Route = createFileRoute("/quiet")({
  head: () => ({
    meta: [
      { title: "Quiet — PACE" },
      { name: "description", content: "Guided breathing, nature sounds, or a quiet rest." },
      { property: "og:title", content: "Quiet — PACE" },
      { property: "og:description", content: "Three calm ways to rest and unwind." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Quiet,
});

const choices = [
  {
    to: "/breathing" as const,
    title: "Breathe with me",
    detail: "A slow circle and gentle spoken cues",
    Icon: Wind,
  },
  { to: "/nature" as const, title: "Nature sounds", detail: "Rain, waves, wind or birds", Icon: Bird },
  { to: "/rest" as const, title: "Rest a while", detail: "A dimmed screen and a soft clock", Icon: Moon },
];

function Quiet() {
  const navigate = useNavigate();
  const { status, announce } = useActivityActions("Quiet");

  return (
    <div className="simple-page wide">
      <p className="eyebrow">Quiet</p>
      <h1>How would you like to rest?</h1>
      <p className="simple-lead">Nothing else is expected of you right now.</p>
      <p className="activity-status" role="status" aria-live="polite">
        {status}
      </p>
      <div className="activity-grid">
        {choices.map(({ to, title, detail, Icon }) => (
          <Button
            key={to}
            variant="outline"
            onClick={() => {
              announce(`Starting ${title.toLowerCase()}.`);
              void navigate({ to });
            }}
          >
            <Icon />
            <span>
              <strong>{title}</strong>
              <small>{detail}</small>
            </span>
          </Button>
        ))}
      </div>
      <ExperienceFeedback choice="Quiet" title="A quiet moment" />
    </div>
  );
}
