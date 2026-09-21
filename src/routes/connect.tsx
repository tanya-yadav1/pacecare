import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Coffee, MessageCircleHeart, Phone, Users, Video } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExperienceFeedback } from "@/components/pace/ExperienceFeedback";
import { primeSpeechForGesture, speakInstructions } from "@/lib/speech";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Connect — PACE" },
      { name: "description", content: "Choose a familiar person or a welcoming shared activity." },
      { property: "og:title", content: "Connect — PACE" },
      { property: "og:description", content: "Simple, senior-controlled ways to connect." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Connect,
});

const connections = [
  { title: "Call Maya", detail: "Your daughter", Icon: Phone, action: "Calling Maya…", kind: "call" as const },
  {
    title: "Video with family",
    detail: "Family group",
    Icon: Video,
    action: "Opening your family video call…",
    kind: "call" as const,
  },
  {
    title: "Garden listening circle",
    detail: "Today at 2:00",
    Icon: Users,
    action: "You’re interested in the garden listening circle.",
  },
  {
    title: "Coffee & stories",
    detail: "Today at 3:30",
    Icon: Coffee,
    action: "You’re interested in coffee and stories.",
  },
];

function Connect() {
  const [selected, setSelected] = useState<(typeof connections)[number] | null>(null);
  const [callStage, setCallStage] = useState<"ringing" | "connected" | null>(null);

  const choose = (item: (typeof connections)[number]) => {
    primeSpeechForGesture();
    setSelected(item);
    if (item.kind === "call") {
      setCallStage("ringing");
      void speakInstructions(item.action).catch(() => {});
      window.setTimeout(() => {
        setCallStage((stage) => {
          if (stage !== "ringing") return stage;
          void speakInstructions("You are connected. This is a sample call screen for practice.").catch(() => {});
          return "connected";
        });
      }, 2600);
    } else {
      setCallStage(null);
      void speakInstructions(item.action).catch(() => {});
    }
  };

  const close = () => {
    setSelected(null);
    setCallStage(null);
  };

  return (
    <div className="simple-page wide">
      <Link to="/" className="simple-back">
        <ChevronLeft />
        Home
      </Link>
      <header className="simple-heading">
        <MessageCircleHeart className="simple-page-icon" />
        <div>
          <p className="eyebrow">Connect</p>
          <h1>Who would you like to be with?</h1>
          <p>You are always in control of who PACE contacts.</p>
        </div>
      </header>
      <div className="connection-grid">
        {connections.map((item) => (
          <Button key={item.title} variant="outline" onClick={() => choose(item)}>
            <item.Icon />
            <span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>
          </Button>
        ))}
      </div>
      {selected && selected.kind === "call" && (
        <section className="connection-confirm call-screen" role="status" aria-live="polite">
          <selected.Icon />
          <div>
            <p className="eyebrow">{callStage === "connected" ? "Connected" : "Calling"}</p>
            <h2>{selected.title}</h2>
            <p>
              {callStage === "connected"
                ? "You are connected. This is a sample call screen for practice."
                : selected.action}
            </p>
            {callStage === "ringing" && <p className="call-ringing">Ringing…</p>}
          </div>
          <Button size="xl" variant={callStage === "connected" ? "default" : "outline"} onClick={close}>
            {callStage === "connected" ? "End call" : "Cancel"}
          </Button>
        </section>
      )}
      {selected && selected.kind !== "call" && (
        <section className="connection-confirm" role="status">
          <selected.Icon />
          <div>
            <p className="eyebrow">Your choice</p>
            <h2>{selected.title}</h2>
            <p>{selected.action}</p>
          </div>
          <Button size="xl" onClick={close}>
            Done
          </Button>
        </section>
      )}
      {selected && <ExperienceFeedback choice="Connect" title={selected.title} />}
    </div>
  );
}
