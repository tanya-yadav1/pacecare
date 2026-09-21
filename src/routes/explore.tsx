import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, Flower2, HeartHandshake, Image as ImageIcon, Palette, PersonStanding, Puzzle, Sparkles, Trees } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExperienceFeedback } from "@/components/pace/ExperienceFeedback";
import { useActivityActions } from "@/lib/pace-activity";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — PACE" },
      {
        name: "description",
        content: "Discover simple activities based on what feels interesting today.",
      },
      { property: "og:title", content: "Explore — PACE" },
      {
        property: "og:description",
        content: "Meaningful, low-pressure activities for older adults.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explore,
});

type Idea = {
  title: string;
  detail: string;
  Icon: typeof Trees;
  /** Opens inside PACE… */
  to?: "/painting" | "/puzzles" | "/story" | "/gentle-movement" | "/gallery" | "/stories";
  /** …or asks staff for help, because it needs people or supplies. */
  wish?: string;
  begin: string;
};

const ideas: Idea[] = [
  {
    title: "Visit the garden",
    detail: "Fresh air and familiar flowers",
    Icon: Trees,
    wish: "would like to visit the garden",
    begin: "Ask staff to take me outside",
  },
  {
    title: "Paint a postcard",
    detail: "Choose colors for someone you love",
    Icon: Palette,
    to: "/painting",
    begin: "Begin painting",
  },
  {
    title: "Try a word puzzle",
    detail: "A relaxed puzzle, on your own or with a friend",
    Icon: Puzzle,
    to: "/puzzles",
    begin: "Begin the puzzle",
  },
  {
    title: "Share a favorite story",
    detail: "Record a memory in your own voice",
    Icon: BookOpen,
    to: "/story",
    begin: "Begin recording",
  },
  {
    title: "Gentle movement",
    detail: "Six seated stretches, at your pace",
    Icon: PersonStanding,
    to: "/gentle-movement",
    begin: "Begin stretching",
  },
  {
    title: "Arrange flowers",
    detail: "A gentle table activity with real flowers",
    Icon: Flower2,
    wish: "would like to arrange flowers",
    begin: "Ask staff for flowers",
  },
  {
    title: "Something with other people",
    detail: "Join a small group today",
    Icon: HeartHandshake,
    wish: "would like to join a group activity",
    begin: "Ask staff about today's group",
  },
  {
    title: "Surprise me",
    detail: "PACE will offer one simple idea",
    Icon: Sparkles,
    to: "/puzzles",
    begin: "Show me the idea",
  },
];

function Explore() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Idea | null>(null);
  const { status, announce, askStaff } = useActivityActions("Explore");

  const begin = (idea: Idea) => {
    if (idea.to) {
      announce(`Starting ${idea.title.toLowerCase()}.`);
      void navigate({ to: idea.to });
      return;
    }
    askStaff(idea.wish ?? `would like: ${idea.title}`, "Staff have been told. Someone will help you soon.");
  };

  return (
    <div className="simple-page wide">
      <p className="eyebrow">Explore</p>
      <h1>Would you like something familiar or new?</h1>
      <p className="simple-lead">There is no wrong choice. You can stop at any time.</p>
      <p className="activity-status" role="status" aria-live="polite">
        {status}
      </p>
      <div className="activity-grid">
        {ideas.map((idea) => (
          <Button
            key={idea.title}
            variant={selected?.title === idea.title ? "default" : "outline"}
            onClick={() => {
              setSelected(idea);
              announce(`${idea.title}. ${idea.detail}.`);
            }}
          >
            <idea.Icon />
            <span>
              <strong>{idea.title}</strong>
              <small>{idea.detail}</small>
            </span>
          </Button>
        ))}
        <Button variant="outline" onClick={() => void navigate({ to: "/gallery" })}>
          <ImageIcon />
          <span>
            <strong>My Gallery</strong>
            <small>Pictures you have painted</small>
          </span>
        </Button>
        <Button variant="outline" onClick={() => void navigate({ to: "/stories" })}>
          <BookOpen />
          <span>
            <strong>My Stories</strong>
            <small>Memories you have recorded</small>
          </span>
        </Button>
      </div>
      {selected && (
        <section className="connection-confirm">
          <selected.Icon />
          <div>
            <p className="eyebrow">A simple place to start</p>
            <h2>{selected.title}</h2>
            <p>{selected.detail}</p>
          </div>
          <Button size="xl" onClick={() => begin(selected)}>
            {selected.begin}
          </Button>
        </section>
      )}
      {selected && <ExperienceFeedback choice="Explore" title={selected.title} />}
    </div>
  );
}
