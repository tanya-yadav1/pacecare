import { createFileRoute, Link } from "@tanstack/react-router";
import { Headphones, Leaf, MessageCircleHeart, Moon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/staff/senior-preview")({
  head: () => ({
    meta: [
      { title: "Senior preview — Staff Mode — PACE" },
      {
        name: "description",
        content: "A staff preview of the senior PACE experience using fictional demo data.",
      },
      { property: "og:title", content: "Senior preview — Staff Mode — PACE" },
      { property: "og:description", content: "Preview the senior PACE experience." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SeniorPreview,
});

const demoChoices = [
  { to: "/listen" as const, label: "Listen", detail: "Music I enjoy", Icon: Headphones, tone: "listen" },
  { to: "/connect" as const, label: "Connect", detail: "Family, friends & neighbors", Icon: MessageCircleHeart, tone: "connect" },
  { to: "/explore" as const, label: "Explore", detail: "Find something meaningful", Icon: Leaf, tone: "explore" },
  { to: "/quiet" as const, label: "Quiet", detail: "Rest and unwind", Icon: Moon, tone: "quiet" },
];

function SeniorPreview() {
  return (
    <div className="senior-preview-page">
      <div className="senior-preview-banner" role="banner">
        <ShieldCheck aria-hidden />
        <span>You are previewing senior mode. Residents do not see staff tools.</span>
        <Button asChild variant="secondary" size="sm">
          <Link to="/staff">Back to staff dashboard</Link>
        </Button>
      </div>

      <div className="senior-preview-inner">
        <p className="senior-preview-greeting">Good afternoon, Eleanor</p>
        <h1>What would you like right now?</h1>

        <div className="senior-choice-grid">
          {demoChoices.map(({ to, label, detail, Icon, tone }) => (
            <Link
              key={to}
              to={to}
              className={`senior-choice senior-choice-${tone}`}
              aria-label={`${label}: ${detail}`}
            >
              <Icon aria-hidden />
              <span>
                <strong>{label}</strong>
                <small>{detail}</small>
              </span>
            </Link>
          ))}
        </div>

        <p className="mission-line">PACE doesn’t decide what matters to you. PACE helps you show us what matters.</p>
      </div>
    </div>
  );
}
