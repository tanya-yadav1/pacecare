import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Headphones,
  Leaf,
  MessageCircleHeart,
  Mic,
  Moon,
  Settings,
  UsersRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { understandPaceChoice } from "@/lib/pace-voice";
import { primeSpeechForGesture, speakInstructions } from "@/lib/speech";

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

type BrowserRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
type RecognitionConstructor = new () => BrowserRecognition;

const choices = [
  {
    to: "/music" as const,
    label: "Listen",
    detail: "Music I enjoy",
    Icon: Headphones,
    tone: "listen",
  },
  {
    to: "/community" as const,
    label: "Connect",
    detail: "Family, friends & neighbors",
    Icon: MessageCircleHeart,
    tone: "connect",
  },
  {
    to: "/mind-body" as const,
    label: "Explore",
    detail: "Find something meaningful",
    Icon: Leaf,
    tone: "explore",
  },
  { to: "/relax" as const, label: "Quiet", detail: "Rest and unwind", Icon: Moon, tone: "quiet" },
];

function SeniorHome() {
  const { name, setMode, accessibility } = useLumaStrideWellness();
  const navigate = useNavigate();
  const recognition = useRef<BrowserRecognition | null>(null);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [typed, setTyped] = useState("");
  const [supported, setSupported] = useState(false);
  const [welcoming, setWelcoming] = useState(false);

  useEffect(() => {
    if (!accessibility.voiceInstructions) return;
    const timer = window.setTimeout(() => {
      void speakInstructions(`Good morning, ${name}. What would you like right now?`).catch(() => {});
    }, 900);
    return () => window.clearTimeout(timer);
  }, [accessibility.voiceInstructions, name]);

  const hearWelcome = async () => {
    primeSpeechForGesture();
    setWelcoming(true);
    try {
      await speakInstructions(`Good morning, ${name}. What would you like right now?`);
    } finally {
      setWelcoming(false);
    }
  };

  useEffect(() => {
    const scope = window as typeof window & {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    };
    const Recognition = scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
    if (!Recognition) return;
    setSupported(true);
    const instance = new Recognition();
    instance.lang = "en-US";
    instance.interimResults = false;
    instance.continuous = false;
    instance.onresult = (event) => handleWords(event.results[0]?.[0]?.transcript ?? "");
    instance.onerror = () => {
      setReply("I couldn't hear that. You can tap a choice or type below.");
      setListening(false);
    };
    instance.onend = () => setListening(false);
    recognition.current = instance;
    return () => instance.stop();
  }, []);

  const handleWords = (words: string) => {
    const clean = words.trim();
    if (!clean) return;
    const result = understandPaceChoice(clean);
    setHeard(clean);
    setReply(result.reply);
    setListening(false);
    void speakInstructions(result.reply).catch(() => {
      setReply(`${result.reply} If you cannot hear PACE, please check your device volume.`);
    });
    const destination = result.path;
    if (destination) window.setTimeout(() => void navigate({ to: destination }), 1100);
  };

  return (
    <div className="senior-home">
      <div className="senior-topline">
        <div>
          <p>
            Good morning, {name} <span aria-hidden>♥</span>
          </p>
          <h1>What would you like right now?</h1>
        </div>
        <div className="home-tools">
          <Button variant="ghost" size="iconLg" asChild>
            <Link to="/accessibility" aria-label="Accessibility settings">
              <Settings />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => void hearWelcome()}
            disabled={welcoming}
          >
            <Mic />
            {welcoming ? "Speaking…" : "Hear welcome"}
          </Button>
          <Button variant="outline" size="lg" asChild onClick={() => setMode("staff")}>
            <Link to="/staff">
              <UsersRound />
              Staff
            </Link>
          </Button>
        </div>
      </div>
      <div className="senior-choice-grid">
        {choices.map(({ to, label, detail, Icon, tone }) => (
          <Link key={to} to={to} className={`senior-choice senior-choice-${tone}`}>
            <Icon aria-hidden />
            <span>
              <strong>{label}</strong>
              <small>{detail}</small>
            </span>
          </Link>
        ))}
      </div>
      <section className="voice-choice">
        <Mic aria-hidden />
        <div>
          <h2>Talk to PACE</h2>
          <p>
            {listening
              ? "I'm listening…"
              : "You can say, “I want music” or “I want to talk to my daughter.”"}
          </p>
          {heard && (
            <p className="voice-confirm">
              <strong>I heard:</strong> “{heard}”
            </p>
          )}
          {reply && <p className="pace-reply">{reply}</p>}
        </div>
        <Button
          size="xl"
          variant="amber"
          onClick={() => {
            if (supported) {
              setListening(true);
              setHeard("");
              setReply("");
              recognition.current?.start();
            } else setReply("Voice listening isn't available here. You can type or tap a choice.");
          }}
          disabled={listening}
        >
          {listening ? "Listening…" : "Speak"}
        </Button>
      </section>
      <form
        className="voice-fallback"
        onSubmit={(event) => {
          event.preventDefault();
          handleWords(typed);
          setTyped("");
        }}
      >
        <label htmlFor="pace-request">Or tell PACE in your own words</label>
        <div>
          <input
            id="pace-request"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder="I want something relaxing"
          />
          <Button size="xl" type="submit" disabled={!typed.trim()}>
            Tell PACE
          </Button>
        </div>
      </form>
      <p className="mission-line">
        PACE doesn’t decide what matters to you. PACE helps you show us what matters.
      </p>
    </div>
  );
}
