import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarPlus,
  ClipboardPen,
  HeartHandshake,
  House,
  MessageCircle,
  Music2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { setResidentPin } from "@/lib/pace-pin.functions";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Caregiver & Staff Demo — PACE" },
      {
        name: "description",
        content:
          "A sample-data care coordination experience centered on each older adult's choices, interests, and connections.",
      },
      { property: "og:title", content: "Caregiver & Staff Demo — PACE" },
      {
        property: "og:description",
        content: "Plan better moments from resident preferences and feedback.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StaffMode,
});

const residents = [
  {
    name: "Eleanor Brooks",
    room: "Willow 214",
    mood: "Would enjoy company",
    likes: ["Jazz", "Garden", "Family calls"],
    last: "Loved garden music yesterday",
  },
  {
    name: "Samuel Ortiz",
    room: "Maple 108",
    mood: "Looking for something new",
    likes: ["Woodworking", "Stories", "Coffee"],
    last: "Asked about the history group",
  },
  {
    name: "Mei Chen",
    room: "Willow 207",
    mood: "Prefers a quiet morning",
    likes: ["Piano", "Birds", "Tea"],
    last: "Quiet time felt just right",
  },
];

function StaffMode() {
  const { setMode } = useLumaStrideWellness();
  const [selected, setSelected] = useState(residents[0]);
  const [handoff, setHandoff] = useState("");
  const [pinEmail, setPinEmail] = useState("");
  const [pinValue, setPinValue] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  if (!selected) return null;
  return (
    <div className="staff-page">
      <header className="staff-heading">
        <div>
          <p className="eyebrow">Caregiver / Staff Mode</p>
          <h1>Better next moments</h1>
          <p>Sample data for the Congressional App Challenge</p>
        </div>
        <Button variant="outline" size="xl" asChild onClick={() => setMode("senior")}>
          <Link to="/">
            <ArrowLeft />
            Senior Mode
          </Link>
        </Button>
      </header>
      <p className="staff-principle">
        PACE doesn’t decide what matters to a senior. PACE helps the senior show us what matters.
      </p>
      <div className="staff-layout">
        <aside className="resident-list" aria-label="Sample residents">
          <h2>Residents</h2>
          {residents.map((resident) => (
            <Button
              key={resident.name}
              variant={selected.name === resident.name ? "default" : "outline"}
              onClick={() => setSelected(resident)}
            >
              <span>
                <strong>{resident.name}</strong>
                <small>
                  {resident.room} · {resident.mood}
                </small>
              </span>
            </Button>
          ))}
        </aside>
        <main className="resident-detail">
          <section className="resident-banner">
            <div className="resident-avatar">
              {selected.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>
            <div>
              <p className="eyebrow">Today with</p>
              <h2>{selected.name}</h2>
              <p>{selected.mood}</p>
            </div>
          </section>
          <div className="staff-grid">
            <article>
              <HeartHandshake />
              <h3>What matters</h3>
              <div className="interest-row">
                {selected.likes.map((like) => (
                  <span key={like}>{like}</span>
                ))}
              </div>
              <p>{selected.last}</p>
            </article>
            <article>
              <CalendarPlus />
              <h3>A thoughtful next moment</h3>
              <p>
                {selected.name.startsWith("Eleanor")
                  ? "Invite Eleanor to the 2:00 garden listening circle, then offer a private family call."
                  : selected.name.startsWith("Samuel")
                    ? "Offer the 3:30 neighborhood stories group with coffee."
                    : "Keep the morning unhurried and offer piano music near tea time."}
              </p>
              <Button
                size="lg"
                onClick={() => setSaved((current) => [...current, `Planned for ${selected.name}`])}
              >
                Add to plan
              </Button>
            </article>
            <article>
              <Users />
              <h3>Group opportunity</h3>
              <p>
                <strong>Three residents</strong> have shown interest in music and outdoor spaces
                this week.
              </p>
              <Button variant="outline" size="lg">
                Plan garden music
              </Button>
            </article>
            <article>
              <MessageCircle />
              <h3>Resident-controlled sharing</h3>
              <p>
                Family sees only moments Eleanor chose to share: music favorites, upcoming calls,
                and personal notes.
              </p>
              <span className="consent-label">Sharing choice confirmed</span>
            </article>
          </div>
          <section className="handoff-panel">
            <ClipboardPen />
            <div>
              <h2>Sign-in PIN for a resident</h2>
              <p>
                Set a simple 4-digit PIN so a resident can sign in without email. Enter their PACE
                email address.
              </p>
              <div className="entry-row">
                <Input
                  value={pinEmail}
                  onChange={(event) => setPinEmail(event.target.value)}
                  placeholder="eleanor@example.com"
                  aria-label="Resident email"
                />
                <Input
                  value={pinValue}
                  onChange={(event) => setPinValue(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1234"
                  aria-label="Four digit PIN"
                />
                <Button
                  size="xl"
                  disabled={pinValue.length !== 4 || !pinEmail.trim()}
                  onClick={async () => {
                    const result = await setResidentPin({
                      data: { email: pinEmail.trim(), pin: pinValue },
                    });
                    setPinMessage(result.message ?? "");
                    if (result.ok) setPinValue("");
                  }}
                >
                  Save PIN
                </Button>
              </div>
              {pinMessage && <p className="saved-line">{pinMessage}</p>}
            </div>
          </section>
          <section className="handoff-panel">
            <ClipboardPen />
            <div>
              <h2>Handoff note</h2>
              <p>Keep it brief, descriptive, and human.</p>
              <div className="entry-row">
                <Input
                  value={handoff}
                  onChange={(event) => setHandoff(event.target.value)}
                  placeholder="Eleanor asked to call Maya after lunch."
                />
                <Button
                  size="xl"
                  onClick={() => {
                    if (handoff.trim()) {
                      setSaved((current) => [...current, handoff.trim()]);
                      setHandoff("");
                    }
                  }}
                >
                  Save
                </Button>
              </div>
              {saved.map((note, index) => (
                <p className="saved-line" key={`${note}-${index}`}>
                  {note}
                </p>
              ))}
            </div>
          </section>
        </main>
      </div>
      <footer className="staff-footer">
        <House /> Demo only · Sample resident information · No medical records
      </footer>
    </div>
  );
}
