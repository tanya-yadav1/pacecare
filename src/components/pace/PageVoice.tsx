import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Mic, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { understandPaceChoice } from "@/lib/pace-voice";
import { onSpeechBlocked, primeSpeechForGesture, speakInstructions } from "@/lib/speech";

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

const pageIntros: Record<string, string> = {
  "/": "PACE home. What would you like right now? You can say listen, connect, explore, or quiet.",
  "/music": "Listen. Here you can play music you enjoy. Tap a song, then press play, pause, or stop.",
  "/community": "Connect. Here you can reach family, friends, or neighbors. Choose someone you would like to connect with.",
  "/mind-body": "Explore. Here you can discover gentle movement, stretching, or breathing activities.",
  "/relax": "Quiet. Take a calm minute to rest. Choose a peaceful sound or simply breathe.",
  "/progress": "My Journey. Look back at moments you enjoyed and add a short note if you like.",
  "/accessibility": "Accessibility settings. Make text larger, turn on high contrast, or switch voice instructions on or off.",
  "/staff": "Staff overview. This screen shows sample residents and thoughtful connection ideas.",
  "/pace-demo": "PACE demo. This is a short sample walk-through with pretend data.",
};

function introFor(path: string, name: string) {
  const base = pageIntros[path] ?? "PACE. Tap Hear this page or Talk to PACE any time.";
  if (path === "/") return base.replace("PACE home", `Good morning, ${name}`);
  return base;
}

export function PageVoice() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const { name, accessibility } = useLumaStrideWellness();
  const recognition = useRef<BrowserRecognition | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [supported, setSupported] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => onSpeechBlocked(setBlocked), []);

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
      setReply("I couldn't hear that. You can tap a choice or type on the home screen.");
      setListening(false);
    };
    instance.onend = () => setListening(false);
    recognition.current = instance;
    return () => instance.stop();
  }, []);

  useEffect(() => {
    if (!accessibility.voiceInstructions) return;
    const timer = window.setTimeout(() => {
      void speak(introFor(path, name));
    }, 700);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, accessibility.voiceInstructions, name]);

  const speak = async (text: string) => {
    setSpeaking(true);
    try {
      await speakInstructions(text);
    } catch {
      // Audio is best-effort; silence should not block the UI.
    } finally {
      setSpeaking(false);
    }
  };

  const handleWords = (words: string) => {
    const clean = words.trim();
    if (!clean) return;
    const lower = clean.toLowerCase();
    if (/home|start over|main page/.test(lower)) {
      setHeard(clean);
      setReply("Going home.");
      void speak("Going home.");
      window.setTimeout(() => void navigate({ to: "/" }), 900);
      setListening(false);
      return;
    }
    if (/back|go back|previous/.test(lower)) {
      setHeard(clean);
      setReply("Going back.");
      void speak("Going back.");
      window.setTimeout(() => window.history.back(), 900);
      setListening(false);
      return;
    }
    const result = understandPaceChoice(clean);
    setHeard(clean);
    setReply(result.reply);
    setListening(false);
    void speak(result.reply);
    const destination = result.path;
    if (destination) window.setTimeout(() => void navigate({ to: destination }), 1100);
  };

  return (
    <div className="page-voice" role="region" aria-label="Audio companion">
      <div className="page-voice-inner">
        {blocked ? (
          <p className="page-voice-reply" aria-live="polite">
            Tap anywhere on the screen to let PACE speak.
          </p>
        ) : reply ? (
          <p className="page-voice-reply" aria-live="polite">
            {reply}
            {heard && <span className="sr-only"> You said: {heard}.</span>}
          </p>
        ) : (
          <p className="page-voice-hint">Tap the buttons to hear this page or talk to PACE.</p>
        )}
        <div className="page-voice-actions">
          <Button
            variant="secondary"
            size="xl"
            onClick={() => {
              primeSpeechForGesture();
              void speak(introFor(path, name));
            }}
            disabled={speaking}
            aria-label="Hear this page"
          >
            <Volume2 aria-hidden />
            {speaking ? "Speaking…" : "Hear this page"}
          </Button>
          <Button
            variant={listening ? "default" : "amber"}
            size="xl"
            onClick={() => {
              primeSpeechForGesture();
              if (supported) {
                setListening(true);
                setHeard("");
                setReply("");
                recognition.current?.start();
              } else {
                setReply("Voice listening isn’t available here. Try the home screen to type your request.");
                void speak(reply);
              }
            }}
            disabled={listening}
            aria-label="Talk to PACE"
          >
            <Mic aria-hidden />
            {listening ? "Listening…" : "Talk to PACE"}
          </Button>
        </div>
      </div>
    </div>
  );
}
