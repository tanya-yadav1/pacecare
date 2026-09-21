import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Mic, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { understandPaceChoice } from "@/lib/pace-voice";
import {
  onSpeechBlocked,
  primeSpeechForGesture,
  speakInstructions,
} from "@/lib/speech";

type BrowserRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: (
    event: {
      results: ArrayLike<{ 0: { transcript: string } }>;
    }
  ) => void;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type RecognitionConstructor = new () => BrowserRecognition;

const pageIntros: Record<string, string> = {
  "/":
    "Good morning. I'm PACE. What would you like to do today? You can tell me, or choose something on the screen.",

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

  const { name, accessibility } = useLumaStrideWellness();

  const recognition = useRef<BrowserRecognition | null>(null);

  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [supported, setSupported] = useState(false);
  const [blocked, setBlocked] = useState(false);

  /*
   * Detect when browser speech is blocked.
   */
  useEffect(() => {
    const cleanup = onSpeechBlocked(setBlocked);

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
      scope.SpeechRecognition ?? scope.webkitSpeechRecognition;

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
      setReply(
        "I couldn't hear that. You can tap a choice or type on the home screen."
      );

      setListening(false);
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
   * Try to introduce PACE when the page opens.
   *
   * If the browser allows speech, PACE speaks automatically.
   * If the browser blocks it, the Start PACE button appears.
   */
  useEffect(() => {
    if (!accessibility.voiceInstructions) {
      return;
    }

    const timer = window.setTimeout(() => {
      void speak(introFor(path, name));
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, accessibility.voiceInstructions, name]);

  /*
   * Speak through the existing PACE speech system.
   */
  const speak = async (text: string) => {
    setSpeaking(true);

    try {
      await speakInstructions(text);
    } catch {
      /*
       * Browser may block automatic audio.
       * Show the large Start PACE fallback.
       */
      setBlocked(true);
    } finally {
      setSpeaking(false);
    }
  };

  /*
   * Start PACE after the senior taps the screen.
   * This user gesture allows browsers to unlock audio.
   */
  const startPace = () => {
    primeSpeechForGesture();

    setBlocked(false);
    setReply("");
    setHeard("");

    void speak(introFor(path, name));
  };

  /*
   * Start speech recognition.
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
   * Repeat the current page introduction.
   */
  const hearPage = () => {
    primeSpeechForGesture();

    setBlocked(false);

    void speak(introFor(path, name));
  };

  /*
   * Handle what the senior says.
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

      setListening(false);

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

      setListening(false);

      return;
    }

    /*
     * Use the existing PACE voice interpretation system.
     */
    const result = understandPaceChoice(clean);

    setHeard(clean);
    setReply(result.reply);
    setListening(false);

    void speak(result.reply);

    const destination = result.path;

    if (destination) {
      window.setTimeout(() => {
        void navigate({ to: destination });
      }, 1100);
    }
  };

  return (
    <div
      className="page-voice"
      role="region"
      aria-label="PACE voice assistant"
    >
      <div className="page-voice-inner">

        {/*
         * Browser blocked automatic speech.
         */}
        {blocked ? (
          <div className="page-voice-welcome">

            <p
              className="page-voice-reply"
              aria-live="polite"
            >
              PACE is ready.
              <br />
              Tap once and I'll talk with you.
            </p>

            <Button
              variant="default"
              size="xl"
              className="pace-start-button"
              onClick={startPace}
              aria-label="Tap to start PACE"
            >
              <Volume2 aria-hidden />
              Tap to Start PACE
            </Button>

          </div>

        ) : reply ? (

          /*
           * PACE response after the senior speaks.
           */
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

          /*
           * Normal PACE status.
           */
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

          {/*
           * Talk to PACE.
           */
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

          {/*
           * Hear PACE.
           */
          <Button
            variant="secondary"
            size="xl"
            onClick={hearPage}
            disabled={speaking}
            aria-label="Hear PACE"
          >
            <Volume2 aria-hidden />

            {speaking
              ? "Speaking…"
              : "Hear PACE"}
          </Button>

        </div>
      </div>
    </div>
  );
}