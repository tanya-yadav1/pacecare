import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Headphones, Home, Leaf, MessageCircleHeart, Moon, Music, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/staff/senior-preview")({
  head: () => ({
    meta: [
      { title: "Senior preview — Staff Mode — PACE" },
      {
        name: "description",
        content: "A staff preview of the senior PACE experience using fictional demo data.",
      },
      { property: "og:title", content: "Senior preview — Staff Mode — PACE" },
      { property: "og:description", content: "Preview the senior PACE experience." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SeniorPreview,
});

const demoChoices = [
  { label: "Listen", detail: "Music I enjoy", Icon: Headphones, tone: "listen" },
  { label: "Connect", detail: "Family, friends & neighbors", Icon: MessageCircleHeart, tone: "connect" },
  { label: "Explore", detail: "Find something meaningful", Icon: Leaf, tone: "explore" },
  { label: "Quiet", detail: "Rest and unwind", Icon: Moon, tone: "quiet" },
];

type DemoResident = {
  id: string;
  name: string;
  fullName: string;
  music: string[];
  people: string[];
  interests: string[];
};

const demoResidents: DemoResident[] = [
  {
    id: "eleanor",
    name: "Eleanor",
    fullName: "Eleanor Brooks",
    music: ["Gospel", "Country", "Big Band"],
    people: ["Maya (Daughter)", "Samuel (Neighbor)"],
    interests: ["Gardening", "Stories", "Birds"],
  },
  {
    id: "walter",
    name: "Walter",
    fullName: "Walter Hayes",
    music: ["Jazz", "Classical"],
    people: ["Ruth (Wife)", "David (Son)"],
    interests: ["Chess", "History", "Radio"],
  },
  {
    id: "rosa",
    name: "Rosa",
    fullName: "Rosa Alvarez",
    music: ["Soul", "Folk"],
    people: ["Carmen (Sister)", "Luis (Grandson)"],
    interests: ["Cooking", "Flowers", "Dancing"],
  },
];

function scheduleFor(resident: DemoResident) {
  const genre = resident.music[0]?.toLowerCase() ?? "music they love";
  const person = resident.people[0]?.split(" (")[0] ?? "someone they care about";
  const interest = resident.interests[0]?.toLowerCase() ?? "something meaningful";
  return [
    { time: "9:00 AM", title: "Listen", detail: `Enjoy some ${genre}`, tone: "listen", Icon: Headphones },
    { time: "11:00 AM", title: "Connect", detail: `Say hello to ${person}`, tone: "connect", Icon: MessageCircleHeart },
    { time: "2:00 PM", title: "Explore", detail: `Spend time with ${interest}`, tone: "explore", Icon: Leaf },
    { time: "4:00 PM", title: "Gentle movement", detail: "A comfortable seated stretch", tone: "explore", Icon: Music },
    { time: "7:00 PM", title: "Quiet time", detail: "Rest and unwind", tone: "quiet", Icon: Moon },
  ];
}

function SeniorPreview() {
  const [view, setView] = useState<"home" | "myday">("home");
  const [residentId, setResidentId] = useState("eleanor");
  const [note, setNote] = useState("");
  const resident = demoResidents.find((r) => r.id === residentId) ?? demoResidents[0]!;
  const schedule = scheduleFor(resident);
  const tap = (label: string) =>
    setNote(`Preview only: a resident tapping "${label}" would open that activity. Staff stay in Staff Mode.`);
  const today = new Date();

  return (
    <div className="senior-preview-page">
      <div className="senior-preview-banner" role="banner">
        <ShieldCheck aria-hidden />
        <span>You are previewing senior mode with fictional demo data.</span>
        <Button asChild variant="secondary" size="sm">
          <Link to="/staff">Back to staff dashboard</Link>
        </Button>
      </div>

      <div className="senior-preview-inner">
        <div className="flex flex-wrap gap-3 mb-6" role="tablist" aria-label="Preview screens">
          <Button size="lg" variant={view === "home" ? "default" : "outline"} role="tab" aria-selected={view === "home"} onClick={() => { setView("home"); setNote(""); }}>
            <Home aria-hidden /> Home
          </Button>
          <Button size="lg" variant={view === "myday" ? "default" : "outline"} role="tab" aria-selected={view === "myday"} onClick={() => { setView("myday"); setNote(""); }}>
            <CalendarDays aria-hidden /> My Day
          </Button>
        </div>

        {note && <p className="simple-note" role="status">{note}</p>}

        {view === "home" ? (
          <>
            <p className="senior-preview-greeting">Good afternoon, {resident.name}</p>
            <h1>What would you like right now?</h1>
            <div className="senior-choice-grid">
              {demoChoices.map(({ label, detail, Icon, tone }) => (
                <button key={label} type="button" onClick={() => tap(label)} className={`senior-choice senior-choice-${tone}`} aria-label={`${label}: ${detail}`}>
                  <Icon aria-hidden />
                  <span>
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </span>
                </button>
              ))}
            </div>
            <p className="mission-line">PACE doesn’t decide what matters to you. PACE helps you show us what matters.</p>
          </>
        ) : (
          <div className="my-day-page">
            <section aria-label="Choose a resident to preview">
              <h2 className="my-day-section-title"><UserRound aria-hidden /> Choose a resident</h2>
              <div className="flex flex-wrap gap-3 mb-6" role="tablist" aria-label="Residents">
                {demoResidents.map((r) => (
                  <Button
                    key={r.id}
                    size="lg"
                    variant={residentId === r.id ? "default" : "outline"}
                    role="tab"
                    aria-selected={residentId === r.id}
                    onClick={() => { setResidentId(r.id); setNote(""); }}
                  >
                    {r.name}
                  </Button>
                ))}
              </div>
            </section>
            <section className="my-day-profile" aria-label="Profile">
              <div className="my-day-avatar" aria-hidden><UserRound /></div>
              <div>
                <h1 className="my-day-greeting">Good afternoon, {resident.name}</h1>
                <p className="my-day-date">{today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
              </div>
            </section>
            <section className="my-day-schedule" aria-labelledby="pv-schedule">
              <h2 id="pv-schedule" className="my-day-section-title"><CalendarDays aria-hidden /> Today's schedule</h2>
              <ul className="my-day-list">
                {schedule.map((item) => (
                  <li key={item.time}>
                    <button type="button" className={`my-day-card my-day-card-${item.tone}`} onClick={() => tap(item.title)}>
                      <span className="my-day-time">{item.time}</span>
                      <span className="my-day-card-title"><item.Icon aria-hidden /> {item.title}</span>
                      <span className="my-day-card-detail">{item.detail}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            <section className="my-day-profile-card" aria-labelledby="pv-profile">
              <h2 id="pv-profile" className="my-day-section-title">My simple profile</h2>
              <dl className="my-day-dl">
                <div><dt>Name</dt><dd>{resident.fullName}</dd></div>
                <div><dt>Favorite music</dt><dd>{resident.music.join(", ")}</dd></div>
                <div><dt>People I care about</dt><dd>{resident.people.join(", ")}</dd></div>
                <div><dt>Things I enjoy</dt><dd>{resident.interests.join(", ")}</dd></div>
              </dl>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
