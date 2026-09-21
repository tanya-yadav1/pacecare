import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Share2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActivityShell } from "@/components/pace/ActivityShell";
import { useActivityActions } from "@/lib/pace-activity";
import { usePaceAuth } from "@/lib/pace-auth";
import { deleteCreation, listCreations, shareCreation, type PaceCreation } from "@/lib/pace-creations";

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "My Stories — PACE" },
      { name: "description", content: "Listen back to the memories you have recorded." },
      { property: "og:title", content: "My Stories — PACE" },
      { property: "og:description", content: "Your recorded memories in PACE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Stories,
});

function Stories() {
  const { user } = usePaceAuth();
  const { status, announce, askStaff } = useActivityActions("My Stories");
  const [stories, setStories] = useState<PaceCreation[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    void listCreations(user.id, "story").then(setStories);
  }, [user?.id]);

  const remove = async (id: string) => {
    await deleteCreation(id);
    setStories((all) => all.filter((item) => item.id !== id));
    setConfirmId(null);
    announce("That story has been removed.");
  };

  return (
    <ActivityShell
      activity="My Stories"
      eyebrow="Explore"
      title="My Stories"
      lead="Your memories, in your own voice."
      status={status}
    >
      {stories.length === 0 ? (
        <section className="simple-center">
          <p className="simple-lead">You have not recorded a story yet.</p>
          <Button size="xl" asChild>
            <Link to="/story">
              <Mic aria-hidden />
              Record a story
            </Link>
          </Button>
        </section>
      ) : (
        <div className="story-list">
          {stories.map((story) => (
            <article key={story.id} className="story-card">
              <h2>{story.title}</h2>
              <audio src={story.content} controls aria-label={story.title} />
              <div className="activity-actions">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    void shareCreation(story.id, { staff: true });
                    askStaff("would like to share a recorded story with staff", "Staff have been told. Someone will listen with you.");
                  }}
                >
                  <Share2 aria-hidden />
                  Share with staff
                </Button>
                <Button size="lg" variant="outline" onClick={() => setConfirmId(story.id)}>
                  <Trash2 aria-hidden />
                  Remove
                </Button>
              </div>
              {confirmId === story.id && (
                <div className="senior-confirm" role="dialog" aria-label="Remove this story">
                  <p>Remove this story for good?</p>
                  <div className="activity-actions">
                    <Button size="lg" onClick={() => void remove(story.id)}>
                      Yes, remove it
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => setConfirmId(null)}>
                      No, keep it
                    </Button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </ActivityShell>
  );
}
