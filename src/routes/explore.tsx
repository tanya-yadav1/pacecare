import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ChevronLeft, Flower2, Palette, Puzzle, Sparkles, Trees } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExperienceFeedback } from "@/components/pace/ExperienceFeedback";

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

const ideas = [
  { title: "Visit the garden", detail: "Fresh air and familiar flowers", Icon: Trees },
  { title: "Paint a postcard", detail: "Choose colors for someone you love", Icon: Palette },
  { title: "Try a word puzzle", detail: "A relaxed puzzle with a friend", Icon: Puzzle },
  { title: "Share a favorite story", detail: "Record or tell a memory", Icon: BookOpen },
  { title: "Arrange flowers", detail: "A gentle table activity", Icon: Flower2 },
  { title: "Surprise me", detail: "PACE will offer one simple idea", Icon: Sparkles },
];

function Explore() {
  const [selected, setSelected] = useState<(typeof ideas)[number] | null>(null);
  return (
    <div className="simple-page wide">
      <Link to="/" className="simple-back">
        <ChevronLeft />
        Home
      </Link>
      <p className="eyebrow">Explore</p>
      <h1>Would you like something familiar or new?</h1>
      <p className="simple-lead">There is no wrong choice. You can stop at any time.</p>
      <div className="activity-grid">
        {ideas.map((idea) => (
          <Button
            key={idea.title}
            variant={selected?.title === idea.title ? "default" : "outline"}
            onClick={() => setSelected(idea)}
          >
            <idea.Icon />
            <span>
              <strong>{idea.title}</strong>
              <small>{idea.detail}</small>
            </span>
          </Button>
        ))}
      </div>
      {selected && (
        <section className="connection-confirm">
          <selected.Icon />
          <div>
            <p className="eyebrow">A simple place to start</p>
            <h2>
              {selected.title === "Surprise me"
                ? "Look through an old photo album"
                : selected.title}
            </h2>
            <p>
              {selected.title === "Surprise me"
                ? "Choose one photo and tell someone what you remember."
                : selected.detail}
            </p>
          </div>
          <Button size="xl">Begin</Button>
        </section>
      )}
      {selected && <ExperienceFeedback choice="Explore" title={selected.title} />}
    </div>
  );
}
