import { createFileRoute, Link } from "@tanstack/react-router";
import { Palette, Printer, Share2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActivityShell } from "@/components/pace/ActivityShell";
import { useActivityActions } from "@/lib/pace-activity";
import { usePaceAuth } from "@/lib/pace-auth";
import { deleteCreation, listCreations, shareCreation, type PaceCreation } from "@/lib/pace-creations";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "My Gallery — PACE" },
      { name: "description", content: "Every picture you have painted, saved in one place." },
      { property: "og:title", content: "My Gallery — PACE" },
      { property: "og:description", content: "Your saved paintings in PACE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const { user } = usePaceAuth();
  const { status, announce, askStaff, doHere } = useActivityActions("My Gallery");
  const [pictures, setPictures] = useState<PaceCreation[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    void listCreations(user.id, "drawing").then(setPictures);
  }, [user?.id]);

  const print = (picture: PaceCreation) => {
    const page = window.open("", "_blank");
    if (!page) {
      announce("Please allow pop-ups to print your picture.");
      return;
    }
    page.document.write(
      `<title>${picture.title}</title><img src="${picture.content}" style="max-width:100%" onload="window.print()" />`,
    );
    page.document.close();
    doHere("Printed a painting", "Sending your picture to the printer.");
  };

  const remove = async (id: string) => {
    await deleteCreation(id);
    setPictures((all) => all.filter((item) => item.id !== id));
    setConfirmId(null);
    announce("That picture has been removed.");
  };

  return (
    <ActivityShell
      activity="My Gallery"
      eyebrow="Explore"
      title="My Gallery"
      lead="Every picture you have painted."
      status={status}
    >
      {pictures.length === 0 ? (
        <section className="simple-center">
          <p className="simple-lead">You have not saved a picture yet.</p>
          <Button size="xl" asChild>
            <Link to="/painting">
              <Palette aria-hidden />
              Begin painting
            </Link>
          </Button>
        </section>
      ) : (
        <div className="gallery-grid">
          {pictures.map((picture) => (
            <article key={picture.id} className="gallery-card">
              <img src={picture.content} alt={picture.title} loading="lazy" />
              <h2>{picture.title}</h2>
              <div className="activity-actions">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    void shareCreation(picture.id, { staff: true });
                    askStaff("would like to show a painting to staff", "Staff have been told. Someone will come and see it.");
                  }}
                >
                  <Share2 aria-hidden />
                  Show staff
                </Button>
                <Button size="lg" variant="outline" onClick={() => print(picture)}>
                  <Printer aria-hidden />
                  Print
                </Button>
                <Button size="lg" variant="outline" onClick={() => setConfirmId(picture.id)}>
                  <Trash2 aria-hidden />
                  Remove
                </Button>
              </div>
              {confirmId === picture.id && (
                <div className="senior-confirm" role="dialog" aria-label="Remove this picture">
                  <p>Remove this picture for good?</p>
                  <div className="activity-actions">
                    <Button size="lg" onClick={() => void remove(picture.id)}>
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
