import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarFigure } from "@/components/vitamove/Brand";
import { useVitaMove } from "@/lib/vitamove-state";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Hub — VitaMove" },
      { name: "description", content: "Leaderboard and supportive circles for the VitaMove Parkinson's community." },
      { property: "og:title", content: "Community Hub — VitaMove" },
      { property: "og:description", content: "Leaderboard and supportive circles for the VitaMove Parkinson's community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Community,
});

const leaders = [
  { name: "Arthur_Stride7", skin: "leopard" as const, streak: 21, weekly: 340 },
  { name: "Elena_BIGMove", skin: "holiday" as const, streak: 18, weekly: 305 },
  { name: "Marcus_Steady", skin: "classic" as const, streak: 12, weekly: 260 },
  { name: "Rosa_Rhythm", skin: "leopard" as const, streak: 9, weekly: 215 },
];

const seedPosts = [
  { id: 1, author: "Elena_BIGMove", skin: "holiday" as const, text: "The LSVT BIG reaching exercise really helped open up my posture this morning!" },
  { id: 2, author: "Arthur_Stride7", skin: "leopard" as const, text: "Twenty-one days of seated hand mobility. My handwriting is steadier already." },
];

function Community() {
  const { awardCommunity, skin } = useVitaMove();
  const [tab, setTab] = useState<"leaderboard" | "circles">("leaderboard");
  const [posts, setPosts] = useState(seedPosts);
  const [draft, setDraft] = useState("");

  return (
    <div className="page">
      <p className="eyebrow">Community Hub</p>
      <h1>Move together, stay encouraged.</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button size="xl" variant={tab === "leaderboard" ? "default" : "outline"} onClick={() => setTab("leaderboard")}>Leaderboard</Button>
        <Button size="xl" variant={tab === "circles" ? "default" : "outline"} onClick={() => setTab("circles")}>Circles</Button>
      </div>

      {tab === "leaderboard" ? (
        <section className="mt-8 space-y-4">
          <h2>This week's movers</h2>
          {leaders.map((l, i) => (
            <article key={l.name} className="feature-card flex flex-wrap items-center gap-4">
              <span className="text-2xl font-extrabold text-primary">#{i + 1}</span>
              <AvatarFigure skin={l.skin} className="h-16 w-16" />
              <div className="flex-1">
                <b className="block text-xl">{l.name}</b>
                <span className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1"><Flame className="text-destructive" aria-hidden /> {l.streak} day streak</span>
                  <span className="flex items-center gap-1"><Star className="fill-accent text-accent-foreground" aria-hidden /> {l.weekly} stars this week</span>
                </span>
              </div>
              <Button size="xl" variant="amber" onClick={() => awardCommunity(l.name)}>Send Encouragement</Button>
            </article>
          ))}
        </section>
      ) : (
        <section className="mt-8 space-y-5">
          <h2>Your circle</h2>
          <form
            className="feature-card flex flex-wrap gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const text = draft.trim();
              if (!text) return;
              setPosts((p) => [{ id: Date.now(), author: "You", skin, text }, ...p]);
              setDraft("");
            }}
          >
            <label className="sr-only" htmlFor="circle-post">Share with your circle</label>
            <input
              id="circle-post"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Share how your movement went today..."
              className="min-h-14 min-w-0 flex-1 rounded-md border-2 border-input px-4"
            />
            <Button size="xl" variant="amber" type="submit"><Send /> Post to Circle</Button>
          </form>
          <div className="space-y-4">
            {posts.map((p) => (
              <article key={p.id} className="feature-card flex animate-[slide-down_.3s_ease-out] gap-4">
                <AvatarFigure skin={p.skin} className="h-14 w-14 shrink-0" />
                <div>
                  <b className="block text-xl">{p.author} posted:</b>
                  <p className="text-muted-foreground">{p.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
