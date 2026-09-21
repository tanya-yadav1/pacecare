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
   * Listen for browser speech-block events.
   */
  useEffect(() => {
    const cleanup = onSpeechBlocked(() => {
      // The Start PACE button provides the required user gesture.
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
   * Use the existing PACE generated speech system.
   */
  const speak = async (text: string) => {
    setSpeaking(true);

    try {
      await speakInstructions(text);
    } catch {
      // Speech failure should not prevent the rest of the app from working.
    } finally {
      setSpeaking(false);
    }
  };

  /*
   * Start PACE.
   *
   * IMPORTANT:
   * speakImmediatelyOnGesture() is called directly from the
   * button interaction so the browser recognizes this as
   * user-initiated speech.
   */
  const startPace = () => {
    const message = introFor(path, name);

    setStarted(true);
    setReply("");
    setHeard("");

    const spoke = speakImmediatelyOnGesture(message);

    /*
     * If native browser speech is unavailable,
     * fall back to the existing generated PACE voice.
     */
    if (!spoke) {
      primeSpeechForGesture();
      void speak(message);
    }
  };

  /*
   * Start listening to the senior.
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

    setListeni
```
