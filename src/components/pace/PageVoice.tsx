import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Mic, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { understandPaceChoice } from "@/lib/pace-voice";
import {
  onSpeechBlocked,
  primeSpeechForGesture,
  speakImmediatelyOnGesture,
  speakInstructions,
} from "@/lib/speech";

type BrowserRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((event: {
        results: ArrayLike<{ 0: { transcript: string } }>;
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type RecognitionConstructor = new () => BrowserRecognition;

const pageIntros: Record<string, string> = {
  "/":
    "Good morning. I'm PACE. I'm here to help you enjoy your day and stay connected. What would you like to do today? You can tell me, or choose something on the screen.",

  "/music":
    "Listen. Here you can play music you enjoy. Tap a song, then press play, pause, or stop.",

  "/community":
    "Connect. Here you can reach family, friends, or neighbors. Choose someone you would like to connect with.",

  "/mind-body":
    "Explore. Here you can discover gentle movement, stretching, or breathing activities.",

  "/relax":
    "Quiet. Take a calm minute to rest. Choose a peaceful sound or simply breathe.",

  "/progress":
    "My Journey. Look back at moments you enjoyed and add a short note if you like.",

  "/accessibility":
    "Accessibility settings. Make text larger, turn on high contrast, or switch voice instructions on or off.",

  "/staff":
    "Staff overview. This screen shows sample residents and thoughtful connection ideas.",

  "/pace-demo":
    "PACE demo. This is a short sample walk-through with pretend data.",
};

function introFor(path: string, name: string) {
  const base =
    pageIntros[path] ??
    "I'm PACE. You can talk to me or choose something on the screen.";

  if (path === "/") {
    return base.replace("Good morning.", `Good morning, ${name}.`);
  }

  return base;
}

export function PageVoice() {
  const path = useRouterState({
    select: (state) => state.location.pathname,
  });

  const navigate = useNavigate();
  const { name } = useLumaStrideWellness();

  const recognition = useRef<BrowserRecognition | null>(null);

  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [supported, setSupported] = useState(false);
  const [started, setStarted] = useState(false);

  /*
   * Listen for speech-block events.
   */
  useEffect(() => {
    const cleanup = onSpeechBlocked(() => {
      // Speech may require a user gesture.
    });

    return cleanup;
  }, []);

  /*
   * Set up browser speech recognition.
   */
  useEffect(() => {
    const scope = window as typeof window & {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    };

    const Recognition =
      scope.SpeechRecognition ??
      scope.webkitSpeechRecognition;

    if (!Recognition) {
      setSupported(false);
      return;
    }

    setSupported(true);

    const instance = new Recognition();

    instance.lang = "en-US";
    instance.interimResults = false;
    instance.continuous = false;

    instance.onresult = (event) => {
      const transcript =
        event.results[0]?.[0]?.transcript ?? "";

      handleWords(transcript);
    };

    instance.onerror = () => {
      setListening(false);
      setReply(
        "I couldn't hear that. You can try again or choose something on the screen."
      );
    };

    instance.onend = () => {
      setListening(false);
    };

    recognition.current = instance;

    return () => {
      instance.stop();
      recognition.current = null;
    };
  }, []);

  /*
   * Existing PACE generated speech.
   */
  const speak = async (text: string) => {
    setSpeaking(true);

    try {
      await speakInstructions(text);
    } catch {
      // Speech failure should not stop the application.
    } finally {
      setSpeaking(false);
    }
  };

  /*
   * Start PACE.
   *
   * Native browser speech is called directly from the
   * button click so the browser recognizes it as
   * user-initiated audio.
   */
  const startPace = () => {
    const message = introFor(path, name);

    setStarted(true);
    setReply("");
    setHeard("");

    const spoke = speakImmediatelyOnGesture(message);

    if (!spoke) {
      primeSpeechForGesture();
      void speak(message);
    }
  };

  /*
   * Start listening.
   */
  const startListening = () => {
    primeSpeechForGesture();

    if (!supported) {
      const message =
        "Voice listening isn't available on this device. You can choose an option on the screen instead.";

      setReply(message);
      void speak(message);
      return;
    }

    if (listening || speaking) {
      return;
    }

    setListening(true);
    setHeard("");
    setReply("");

    try {
      recognition.current?.start();
    } catch {
      setListening(false);

      const message =
        "Let's try that again. You can tap a choice on the screen.";

      setReply(message);
      void speak(message);
    }
  };

  /*
   * Hear the current page.
   */
  const hearPage = () => {
    primeSpeechForGesture();

    const message = introFor(path, name);

    void speak(message);
  };

  /*
   * Interpret what the senior says.
   */
  const handleWords = (words: string) => {
    const clean = words.trim();

    if (!clean) {
      return;
    }

    const lower = clean.toLowerCase();

    /*
     * Home command.
     */
    if (/home|start over|main page/.test(lower)) {
      setHeard(clean);
      setReply("Going home.");

      void speak("Going home.");

      window.setTimeout(() => {
        void navigate({ to: "/" });
      }, 900);

      return;
    }

    /*
     * Back command.
     */
    if (/back|go back|previous/.test(lower)) {
      setHeard(clean);
      setReply("Going back.");

      void speak("Going back.");

      window.setTimeout(() => {
        window.history.back();
      }, 900);

      return;
    }

    /*
     * Use the existing PACE voice interpretation.
     */
    const result = understandPaceChoice(clean);

    setHeard(clean);
    setReply(result.reply);

    void speak(result.reply);

    if (result.path) {
      window.setTimeout(() => {
        void navigate({ to: result.path });
      }, 1100);
    }
  };

  /*
   * FIRST SCREEN
   *
   * PACE waits for one simple tap.
   * The tap then starts the spoken welcome.
   */
  if (!started) {
    return (
      <div
        className="page-voice"
        role="region"
        aria-label="Welcome to PACE"
      >
        <div className="page-voice-inner">
          <div className="page-voice-welcome">
            <Volume2
              aria-hidden
              className="page-voice-welcome-icon"
            />

            <p
              className="page-voice-reply"
              aria-live="polite"
            >
              Welcome to PACE.
            </p>

            <p className="page-voice-hint">
              I'm here to help you enjoy your day,
              stay connected, and feel supported.
            </p>

            <Button
              variant="default"
              size="xl"
              className="pace-start-button"
              onClick={startPace}
              aria-label="Start PACE and hear your welcome"
            >
              <Volume2 aria-hidden />
              Start PACE
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * NORMAL PACE EXPERIENCE.
   */
  return (
    <div
      className="page-voice"
      role="region"
      aria-label="PACE voice assistant"
    >
      <div className="page-voice-inner">
        {reply ? (
          <p
            className="page-voice-reply"
            aria-live="polite"
          >
            {reply}

            {heard && (
              <span className="sr-only">
                {" "}
                You said: {heard}.
              </span>
            )}
          </p>
        ) : (
          <p
            className="page-voice-hint"
            aria-live="polite"
          >
            {speaking
              ? "PACE is speaking…"
              : listening
                ? "I'm listening… Take your time."
                : `Good morning, ${name}.`}
          </p>
        )}

        <div className="page-voice-actions">
          <Button
            variant={listening ? "default" : "amber"}
            size="xl"
            onClick={startListening}
            disabled={listening || speaking}
            aria-label="Talk to PACE"
          >
            <Mic aria-hidden />

            {listening
              ? "Listening…"
              : "Talk to PACE"}
          </Button>

          <Button
            variant="secondary"
            size="xl"
            onClick={hearPage}
            disabled={speaking}
            aria-label="Hear this page"
          >
            <Volume2 aria-hidden />

            {speaking
              ? "Speaking…"
              : "Hear this page"}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Important:** when copying this into Lovable, make sure you copy **all the way to the final `}`**. Your previous paste stopped at `setListeni`, which is definitely incomplete.

After pasting, save and let Lovable build. If it says **successful**, test **Start PACE** first.
