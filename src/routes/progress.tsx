import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  Heart,
  MessageSquarePlus,
  Music2,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "My Moments — PACE" },
      {
        name: "description",
        content: "A personal record of choices, connections, activities, and discoveries.",
      },
      { property: "og:title", content: "My Moments — PACE" },
      {
        property: "og:description",
        content: "Remember what felt meaningful and discover what to enjoy next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Moments,
});

function Moments() {
  const { moments, personalNotes, addPersonalNote, removePersonalNote } = useLumaStrideWellness();
  const [note, setNote] = useState("");
  return (
    <div className="simple-page wide">
      <Link to="/" className="simple-back">
        <ChevronLeft />
        Home
      </Link>
      <p className="eyebrow">Discovery</p>
      <h1>My moments</h1>
      <p className="simple-lead">
        The people, activities, and quiet moments that have mattered to you.
      </p>
      <section className="journey-note">
        <h2>
          <MessageSquarePlus />
          Remember a moment
        </h2>
        <div className="entry-row">
          <Input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="I enjoyed music with Maya today."
          />
          <Button
            size="xl"
            onClick={() => {
              if (note.trim()) {
                addPersonalNote(note.trim());
                setNote("");
              }
            }}
          >
            Save
          </Button>
        </div>
      </section>
      <div className="progress-summary">
        <article>
          <Heart />
          <strong>{moments.filter((item) => item.feedback === "Loved it").length}</strong>
          <span>Loved moments</span>
        </article>
        <article>
          <Users />
          <strong>{moments.filter((item) => item.choice === "Connect").length}</strong>
          <span>Connections</span>
        </article>
        <article>
          <Music2 />
          <strong>{moments.filter((item) => item.choice === "Listen").length}</strong>
          <span>Listening moments</span>
        </article>
        <article>
          <Sparkles />
          <strong>{moments.filter((item) => item.choice === "Explore").length}</strong>
          <span>New discoveries</span>
        </article>
      </div>
      <section className="history-section">
        <h2>Recent choices</h2>
        {moments.length ? (
          moments.map((item) => (
            <article key={item.id}>
              <Heart />
              <div>
                <strong>{item.title}</strong>
                <span>
                  {item.choice} · {item.feedback ?? "No feedback yet"} ·{" "}
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </div>
            </article>
          ))
        ) : (
          <p className="empty-state">
            Your choices will appear here after you enjoy an experience.
          </p>
        )}
      </section>
      <section className="history-section">
        <h2>Personal notes</h2>
        {personalNotes.length ? (
          personalNotes.map((item) => (
            <article key={item.id}>
              <MessageSquarePlus />
              <div>
                <strong>{item.text}</strong>
                <span>{new Date(item.date).toLocaleDateString()}</span>
              </div>
              <Button
                size="iconLg"
                variant="ghost"
                aria-label="Delete note"
                onClick={() => removePersonalNote(item.id)}
              >
                <Trash2 />
              </Button>
            </article>
          ))
        ) : (
          <p className="empty-state">
            You can save a good moment, a preference, or something you want others to know.
          </p>
        )}
      </section>
    </div>
  );
}
