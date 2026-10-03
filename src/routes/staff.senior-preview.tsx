import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Headphones, Leaf, MessageCircleHeart, Moon, Music, ShieldCheck, UserRound, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { listMyEvents, type PaceEvent } from "@/lib/pace-events";

export const Route = createFileRoute("/staff/senior-preview")({
  head: () => ({
    meta: [
      { title: "Senior preview — Staff Mode — PACE" },
      {
        name: "description",
        content: "A staff preview of a resident's day in PACE: schedule, recent choices, and simple profile.",
      },
      { property: "og:title", content: "Senior preview — Staff Mode — PACE" },
      {
        property: "og:description",
        content: "See the day ahead for each resident without leaving Staff Mode.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SeniorPreview,
});

type PreviewResident = {
  id: string;
  name: string;
  fullName: string;
  music: string[];
  people: string[];
  interests: string[];
  notes: string | null;
};

/** Invented residents used only when an account has no saved details yet. */
const fallbacks: PreviewResident[] = [
  {
    id: "eleanor",
    name: "Eleanor",
    fullName: "Eleanor Brooks",
    music: ["Gospel", "Country", "Big Band"],
    people: ["Maya (Daughter)", "Samuel (Neighbor)"],
    interests: ["Gardening", "Stories", "Birds"],
    notes: null,
  },
  {
    id: "walter",
    name: "Walter",
    fullName: "Walter Hayes",
    music: ["Jazz", "Classical"],
    people: ["Ruth (Wife)", "David (Son)"],
    interests: ["Chess", "History", "Radio"],
    notes: null,
  },
  {
    id: "rosa",
    name: "Rosa",
    fullName: "Rosa Alvarez",
    music: ["Soul", "Folk"],
    people: ["Carmen (Sister)", "Luis (Grandson)"],
    interests: ["Cooking", "Flowers", "Dancing"],
    notes: null,
  },
];

type ProfileRow = {
  id: string;
  display_name: string | null;
  greeting_name: string | null;
  email: string | null;
  staff_notes: string | null;
  preferences: Record<string, unknown> | null;
};

function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function peopleList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        const name = typeof record["name"] === "string" ? record["name"] : "";
        const relationship = typeof record["relationship"] === "string" ? record["relationship"] : "";
        if (name) return relationship ? `${name} (${relationship})` : name;
      }
      return "";
    })
    .filter(Boolean);
}

function scheduleFor(resident: PreviewResident) {
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
  const [residents, setResidents] = useState<PreviewResident[]>(fallbacks);
  const [residentId, setResidentId] = useState(fallbacks[0]!.id);
  const [events, setEvents] = useState<PaceEvent[]>([]);
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [profiles, staffRoles] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, greeting_name, email, staff_notes, preferences")
          .order("display_name"),
        supabase.from("user_roles").select("user_id").eq("role", "staff"),
      ]);
      const staffIds = new Set(
        ((staffRoles.data ?? []) as { user_id: string }[]).map((row) => row.user_id),
      );
      const rows = ((profiles.data ?? []) as ProfileRow[]).filter((row) => !staffIds.has(row.id));
      const list: PreviewResident[] = rows.map((row) => {
        const prefs = (row.preferences ?? {}) as Record<string, unknown>;
        const name = row.greeting_name || row.display_name || row.email?.split("@")[0] || "Resident";
        return {
          id: row.id,
          name,
          fullName: row.display_name || name,
          music: asList(prefs["music"]).length ? asList(prefs["music"]) : asList(prefs["favorite_genres"]),
          people: peopleList(prefs["people"]),
          interests: asList(prefs["interests"]),
          notes: row.staff_notes,
        };
      });
      if (!active) return;
      if (list.length > 0) {
        setResidents(list);
        setResidentId((current) => (list.some((r) => r.id === current) ? current : list[0]!.id));
      }
      setLoaded(true);
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const resident = residents.find((r) => r.id === residentId) ?? residents[0]!;

  useEffect(() => {
    let active = true;
    if (!loaded) return;
    void listMyEvents(resident.id).then((rows) => {
      if (active) setEvents(rows);
    });
    return () => {
      active = false;
    };
  }, [loaded, resident.id]);

  const schedule = scheduleFor(resident);
  const tap = (label: string) =>
    setNote(`Preview only: a resident tapping "${label}" would open that activity. Staff stay in Staff Mode.`);
  const today = new Date();
  const recent = events.slice(0, 6);

  return (
    <div className="senior-preview-page">
      <div className="senior-preview-banner" role="banner">
        <ShieldCheck aria-hidden />
        <span>You are previewing a resident's day. Staff stay in Staff Mode.</span>
        <Button asChild variant="secondary" size="sm">
          <Link to="/staff">Back to staff dashboard</Link>
        </Button>
      </div>

      <div className="senior-preview-inner">
        <section className="preview-resident-picker" aria-label="Choose a resident">
          <label className="preview-resident-label" htmlFor="preview-resident">
            <Users aria-hidden /> Choose a resident
          </label>
          <select
            id="preview-resident"
            className="preview-resident-select"
            value={residentId}
            onChange={(event) => {
              setResidentId(event.target.value);
              setNote("");
            }}
          >
            {residents.map((person) => (
              <option key={person.id} value={person.id}>
                {person.fullName}
              </option>
            ))}
          </select>
        </section>

        {note && <p className="simple-note" role="status">{note}</p>}

        <div className="my-day-page">
          <section className="my-day-profile" aria-label="Profile">
            <div className="my-day-avatar" aria-hidden><UserRound /></div>
            <div>
              <h1 className="my-day-greeting">Good afternoon, {resident.name}</h1>
              <p className="my-day-date">
                {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </section>

          <section className="my-day-schedule" aria-labelledby="pv-schedule">
            <h2 id="pv-schedule" className="my-day-section-title">
              <CalendarDays aria-hidden /> Today's schedule
            </h2>
            <ul className="my-day-list">
              {schedule.map((item) => (
                <li key={item.time}>
                  <button
                    type="button"
                    className={`my-day-card my-day-card-${item.tone}`}
                    onClick={() => tap(item.title)}
                  >
                    <span className="my-day-time">{item.time}</span>
                    <span className="my-day-card-title"><item.Icon aria-hidden /> {item.title}</span>
                    <span className="my-day-card-detail">{item.detail}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="my-day-profile-card" aria-labelledby="pv-recent">
            <h2 id="pv-recent" className="my-day-section-title">Recent choices and requests</h2>
            {recent.length === 0 ? (
              <p className="my-day-empty">Nothing yet today. Choices a resident makes appear here.</p>
            ) : (
              <ul className="preview-recent-list">
                {recent.map((event) => (
                  <li key={event.id}>
                    <span className="preview-recent-label">{event.label}</span>
                    <span className="preview-recent-meta">
                      {event.kind === "help"
                        ? "Asked for help"
                        : event.kind === "choice"
                          ? "Made a choice"
                          : "Did an activity"}
                      {" · "}
                      {new Date(event.created_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="my-day-profile-card" aria-labelledby="pv-profile">
            <h2 id="pv-profile" className="my-day-section-title">Simple profile</h2>
            <dl className="my-day-dl">
              <div><dt>Name</dt><dd>{resident.fullName}</dd></div>
              <div><dt>Favorite music</dt><dd>{resident.music.join(", ") || "Not saved yet"}</dd></div>
              <div><dt>People I care about</dt><dd>{resident.people.join(", ") || "Not saved yet"}</dd></div>
              <div><dt>Things I enjoy</dt><dd>{resident.interests.join(", ") || "Not saved yet"}</dd></div>
              <div><dt>Staff notes</dt><dd>{resident.notes?.trim() || "No notes yet"}</dd></div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
