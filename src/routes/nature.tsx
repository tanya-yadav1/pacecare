import { createFileRoute } from "@tanstack/react-router";
import { Bird, CloudRain, Square, Waves, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActivityShell } from "@/components/pace/ActivityShell";
import { useActivityActions } from "@/lib/pace-activity";
import { ambientVolume, playAmbient, setAmbientVolume, stopAmbient, type AmbientKind } from "@/lib/ambient-sounds";

export const Route = createFileRoute("/nature")({
  head: () => ({
    meta: [
      { title: "Nature sounds — PACE" },
      { name: "description", content: "Gentle rain, waves, wind and birdsong you can play right away." },
      { property: "og:title", content: "Nature sounds — PACE" },
      { property: "og:description", content: "Calming nature sounds, made inside the app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Nature,
});

const SOUNDS: { key: AmbientKind; label: string; Icon: typeof CloudRain }[] = [
  { key: "rain", label: "Soft rain", Icon: CloudRain },
  { key: "waves", label: "Ocean waves", Icon: Waves },
  { key: "wind", label: "Gentle wind", Icon: Wind },
  { key: "birds", label: "Morning birds", Icon: Bird },
];

function Nature() {
  const { status, announce, doHere } = useActivityActions("Nature sounds");
  const [playing, setPlaying] = useState<AmbientKind | null>(null);
  const [volume, setVolume] = useState(() => ambientVolume());

  useEffect(() => () => stopAmbient(), []);

  return (
    <ActivityShell
      activity="Nature sounds"
      eyebrow="Quiet"
      title="Nature sounds"
      lead="Choose a sound and rest for as long as you like."
      status={status}
    >
      <div className="activity-grid">
        {SOUNDS.map(({ key, label, Icon }) => (
          <Button
            key={key}
            size="xl"
            variant={playing === key ? "default" : "outline"}
            aria-pressed={playing === key}
            onClick={() => {
              void playAmbient(key).catch(() => announce("This device cannot play sounds."));
              setPlaying(key);
              doHere(`Listened to ${label.toLowerCase()}`, `Playing ${label.toLowerCase()}.`);
            }}
          >
            <Icon aria-hidden />
            <span>
              <strong>{label}</strong>
            </span>
          </Button>
        ))}
      </div>

      <p className="now-playing" aria-live="polite">
        {playing ? `Now playing: ${SOUNDS.find((sound) => sound.key === playing)?.label}` : "Nothing playing yet"}
      </p>

      <div className="activity-actions">
        <Button
          size="xl"
          variant="outline"
          disabled={!playing}
          onClick={() => {
            stopAmbient();
            setPlaying(null);
            announce("Sounds stopped.");
          }}
        >
          <Square aria-hidden />
          Stop
        </Button>
      </div>

      <label className="volume-control">
        Volume
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(event) => {
            const next = Number(event.target.value) / 100;
            setVolume(next);
            setAmbientVolume(next);
          }}
          aria-label="Sound volume"
        />
      </label>
    </ActivityShell>
  );
}
