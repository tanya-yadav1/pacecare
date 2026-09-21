import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Headphones, Leaf, MessageCircleHeart, Mic, Moon, Settings, Square, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { friendlyStatus, listMyEvents, recordEvent, type PaceEvent } from "@/lib/pace-events";
import { usePaceAuth } from "@/lib/pace-auth";
import { useSeniorVoice } from "@/lib/senior-voice";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PACE — Personalized Aging & Connection Experience" },
      {
        name: "description",
        content:
          "A warm, voice-first experience that helps older adults express what they want and connect with meaningful moments and people.",
      },
      { property: "og:title", content: "PACE — Your voice. Your choice. Your moment." },
      { property: "og:description", content: "PACE helps older adults show what matters to them." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SeniorHome,
});

const choices = [
  { to: "/listen" as const, label: "Listen", detail: "Music I enjoy", Icon: Headphones, tone: "listen" },
  {
    to: "/connect" as const,
    label: "Connect",
    detail: "Family, friends & neighbors",
    Icon: MessageCircleHeart,
    tone: "connect",
  },
  { to: "/explore" as const, label: "Explore", detail: "Find something meaningful", Icon: Leaf, tone: "explore" },
  { to: "/quiet" as const, label: "Quiet", detail: "Rest and unwind", Icon: Moon, tone: "quiet" },
];

const TALK_TEXT = "Talk to PACE. You can say, I want music, or, I want to talk to my daughter.";

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function SeniorHome() {
  const { name } = useLumaStrideWellness();
  const { loading, session, user, preferences, savePreferences } = usePaceAuth();
  const navigate = useNavigate();
  const [greeting] = useState(() => greetingFor(new Date().getHours()));
  const [myEvents, setMyEvents] = useState<PaceEvent[]>([]);

  const orderedChoices = [...choices].sort(
    (a, b) => (preferences.tileUsage[b.label] ?? 0) - (preferences.tileUsage[a.label] ?? 0),
  );

  const rememberChoice = (label: string, path: string) => {
    void savePreferences({
      tileUsage: { ...preferences.tileUsage, [label]: (preferences.tileUsage[label] ?? 0) + 1 },
      lastMoment: { label, path },
    });
    if (user?.id) void recordEvent({ residentId: user.id, kind: "choice", label: `Chose ${label}` });
  };

  const voice = useSeniorVoice({
    readAloud: () => [
      `${greeting}, ${name}.`,
      "What would you like right now?",
      ...orderedChoices.map((choice) => `${choice.label}. ${choice.detail}.`),
      TALK_TEXT,
    ],
    onChoice: rememberChoice,
  });

  useEffect(() => {
    if (loading || !session || preferences.onboarded) return;
    void navigate({ to: "/onboarding", replace: true });
  }, [loading, session, preferences.onboarded, navigate]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    const load = async () => {
      const events = await listMyEvents(user.id);
      if (active) setMyEvents(events.filter((event) => event.kind !== "activity").slice(0, 3));
    };
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [user?.id]);

  const lastMoment = preferences.lastMoment;
  const busy = voice.speaking || voice.listening;

  return (
    <div className="senior-home">
      <div className="voice-bar">
        <Button className="voice-bar-button" size="xl" onClick={voice.startPace} disabled={busy}>
          <Volume2 aria-hidden />
          Start PACE
        </Button>
        <Button
          className="voice-bar-button"
          size="xl"
          variant="outline"
          onClick={voice.talk}
          disabled={!voice.started || busy}
        >
          <Mic aria-hidden />
          {voice.listening ? "Listening…" : "Talk to PACE"}
        </Button>
        {busy && (
          <Button className="voice-bar-button" size="xl" variant="secondary" onClick={voice.stop}>
            <Square aria-hidden />
            Stop
          </Button>
        )}
      </div>
      {(voice.heard || voice.reply) && (
        <div className="voice-status" role="status" aria-live="polite">
          {voice.heard && (
            <p>
              <strong>You said:</strong> “{voice.heard}”
            </p>
          )}
          {voice.reply && <p className="pace-reply">{voice.reply}</p>}
        </div>
      )}

      <div className="senior-topline">
        <div>
          <p>
            {greeting}, {name} <span aria-hidden>♥</span>
          </p>
          <h1>What would you like right now?</h1>
        </div>
        <div className="home-tools">
          <Button variant="ghost" size="iconLg" asChild>
            <Link to="/settings" aria-label="My settings">
              <Settings />
            </Link>
          </Button>
        </div>
      </div>

      {myEvents.length > 0 && (
        <section className="request-status" aria-live="polite">
          <h2>What the team is doing for you</h2>
          {myEvents.map((event) => (
            <p key={event.id}>
              {event.status === "in_progress" && event.label.toLowerCase().includes("daughter")
                ? "Your daughter is being called."
                : friendlyStatus(event)}
            </p>
          ))}
        </section>
      )}

      {lastMoment && (
        <Link to={lastMoment.path as "/listen"} className="senior-continue">
          <strong>Continue where you left off</strong>
          <small>{lastMoment.label}</small>
        </Link>
      )}

      <div className="senior-choice-grid">
        {orderedChoices.map(({ to, label, detail, Icon, tone }) => (
          <Link
            key={to}
            to={to}
            onClick={() => rememberChoice(label, to)}
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
  );
}
