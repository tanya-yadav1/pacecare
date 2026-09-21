import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Mic, Play, RotateCcw, Save, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActivityShell } from "@/components/pace/ActivityShell";
import { useActivityActions } from "@/lib/pace-activity";
import { usePaceAuth } from "@/lib/pace-auth";
import { saveCreation } from "@/lib/pace-creations";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "Record a memory — PACE" },
      { name: "description", content: "Record a short spoken memory and keep it in My Stories." },
      { property: "og:title", content: "Record a memory — PACE" },
      { property: "og:description", content: "Tell a story in your own voice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StoryRecorder,
});

const PROMPTS = [
  "Tell me about your favorite meal growing up.",
  "What was your first job like?",
  "Tell me about a place you loved to visit.",
  "Who made you laugh the most when you were young?",
  "What song always brings back a happy memory?",
];

const MAX_SECONDS = 180;

function StoryRecorder() {
  const { user } = usePaceAuth();
  const { status, announce, doHere } = useActivityActions("Memories");
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const timer = useRef<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
      recorder.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stop = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
    recorder.current?.stop();
    recorder.current?.stream.getTracks().forEach((track) => track.stop());
    setRecording(false);
  };

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      announce("This device cannot record sound. You can still tell your story to a staff member.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const media = new MediaRecorder(stream);
      chunks.current = [];
      media.ondataavailable = (event) => chunks.current.push(event.data);
      media.onstop = () => {
        const blob = new Blob(chunks.current, { type: media.mimeType || "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        const reader = new FileReader();
        reader.onload = () => setAudioData(String(reader.result));
        reader.readAsDataURL(blob);
      };
      recorder.current = media;
      media.start();
      setAudioUrl(null);
      setAudioData(null);
      setSeconds(0);
      setRecording(true);
      announce("Recording. Take your time.");
      timer.current = window.setInterval(() => {
        setSeconds((value) => {
          if (value + 1 >= MAX_SECONDS) {
            stop();
            announce("That is three minutes. Your story is ready to play.");
            return MAX_SECONDS;
          }
          return value + 1;
        });
      }, 1000);
    } catch {
      announce("PACE needs permission to use the microphone. Please allow it, or ask staff for help.");
    }
  };

  const save = async () => {
    if (!audioData || !user?.id) {
      announce("Record a story first.");
      return;
    }
    announce("Saving your story…");
    const created = await saveCreation({
      residentId: user.id,
      kind: "story",
      title: `Story from ${new Date().toLocaleDateString()}`,
      content: audioData,
    });
    if (!created) {
      announce("Your story could not be saved. Please ask staff for help.");
      return;
    }
    doHere("Recorded a memory", "Saved to My Stories.");
  };

  return (
    <ActivityShell
      activity="Memories"
      eyebrow="Explore"
      title="Share a favorite story"
      lead="Press the big microphone and talk for up to three minutes."
      status={status}
    >
      <section className="story-recorder">
        <button
          type="button"
          className={`mic-button${recording ? " is-recording" : ""}`}
          onClick={() => (recording ? (stop(), announce("Recording stopped.")) : void start())}
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          {recording ? <Square aria-hidden /> : <Mic aria-hidden />}
          <span>{recording ? "Stop" : "Record"}</span>
        </button>
        <p className="story-timer" aria-live="polite">
          {recording ? `Recording… ${seconds} seconds` : audioUrl ? "Ready to play" : "Not recording"}
        </p>
      </section>

      {audioUrl && (
        <section className="story-playback">
          <audio src={audioUrl} controls aria-label="Your recorded story" />
          <div className="activity-actions">
            <Button
              size="xl"
              onClick={() => {
                const player = document.querySelector<HTMLAudioElement>(".story-playback audio");
                void player?.play();
                announce("Playing your story.");
              }}
            >
              <Play aria-hidden />
              Play
            </Button>
            <Button size="xl" variant="outline" onClick={() => void start()}>
              <RotateCcw aria-hidden />
              Re-record
            </Button>
            <Button size="xl" onClick={() => void save()}>
              <Save aria-hidden />
              Save
            </Button>
          </div>
        </section>
      )}

      <section className="prompt-list">
        <h2>Need an idea?</h2>
        {PROMPTS.map((prompt) => (
          <Button key={prompt} size="xl" variant="outline" onClick={() => announce(prompt)}>
            {prompt}
          </Button>
        ))}
      </section>

      <div className="activity-actions">
        <Button size="xl" variant="outline" asChild>
          <Link to="/stories">
            <BookOpen aria-hidden />
            My Stories
          </Link>
        </Button>
      </div>
    </ActivityShell>
  );
}
