import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { understandPaceChoice } from "@/lib/pace-voice";

type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
type RecognitionConstructor = new () => RecognitionLike;

export const WELCOME_LINE = "Welcome to PACE. Your voice. Your choice. Your moment.";

/** Picks the line on the page that best matches what the senior said. */
export function bestMatch(said: string, lines: string[]) {
  const words = said.toLowerCase().split(/\W+/).filter((word) => word.length > 3);
  let best: { line: string; score: number } | null = null;
  for (const line of lines) {
    const lower = line.toLowerCase();
    const score = words.reduce((total, word) => (lower.includes(word) ? total + 1 : total), 0);
    if (score > 0 && (!best || score > best.score)) best = { line, score };
  }
  return best?.line ?? null;
}

/**
 * One shared voice brain for the senior screens: speaks the page aloud,
 * listens, and moves to the page the senior asked for.
 */
export function useSeniorVoice(options: {
  /** Everything PACE should read aloud, in order. Never the menu or footer. */
  readAloud: () => string[];
  onChoice?: (label: string, path: string) => void;
}) {
  const navigate = useNavigate();
  const recognition = useRef<RecognitionLike | null>(null);
  const [started, setStarted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [supported, setSupported] = useState(false);
  const readAloudRef = useRef(options.readAloud);
  readAloudRef.current = options.readAloud;
  const onChoiceRef = useRef(options.onChoice);
  onChoiceRef.current = options.onChoice;

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const Utterance = window.SpeechSynthesisUtterance;
    if (!Utterance) return;
    window.speechSynthesis.cancel();
    const message = new Utterance(text);
    message.rate = 0.78;
    message.pitch = 1;
    message.volume = 1;
    message.onend = () => setSpeaking(false);
    message.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(message);
  }, []);

  const handleWords = useCallback(
    (words: string) => {
      const clean = words.trim();
      setListening(false);
      if (!clean) return;
      setHeard(clean);

      const result = understandPaceChoice(clean);
      if (result.path) {
        setReply(result.reply);
        speak(result.reply);
        const destination = result.path;
        const label =
          destination === "/listen"
            ? "Listen"
            : destination === "/connect"
              ? "Connect"
              : destination === "/explore"
                ? "Explore"
                : "Quiet";
        onChoiceRef.current?.(label, destination);
        window.setTimeout(() => void navigate({ to: destination }), 1200);
        return;
      }

      const match = bestMatch(clean, readAloudRef.current());
      const answer = match ?? result.reply;
      setReply(answer);
      speak(answer);
    },
    [navigate, speak],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
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
      setListening(false);
      setReply("I couldn't hear that. You can tap a choice instead.");
    };
    instance.onend = () => setListening(false);
    recognition.current = instance;
    return () => {
      try {
        instance.stop();
      } catch {
        // nothing to stop
      }
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [handleWords]);

  const startPace = useCallback(() => {
    setStarted(true);
    setHeard("");
    setReply("");
    speak([WELCOME_LINE, ...readAloudRef.current()].join(" "));
  }, [speak]);

  const talk = useCallback(() => {
    if (!supported || !recognition.current) {
      setReply("Talking isn't available on this device. You can tap a choice instead.");
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    setHeard("");
    setReply("");
    setListening(true);
    try {
      recognition.current.start();
    } catch {
      setListening(false);
    }
  }, [supported]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    try {
      recognition.current?.stop();
    } catch {
      // nothing to stop
    }
    setListening(false);
  }, []);

  return { started, speaking, listening, heard, reply, startPace, talk, stop, speak, handleWords };
}
