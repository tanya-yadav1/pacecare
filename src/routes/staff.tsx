import { createFileRoute, Outlet, useChildMatches } from "@tanstack/react-router";
import { CheckCircle2, ClipboardPen, LifeBuoy, Search, Timer, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { listAllEvents, setEventStatus, type PaceEvent } from "@/lib/pace-events";
import { setResidentPin } from "@/lib/pace-pin.functions";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff dashboard — PACE" },
      {
        name: "description",
        content:
          "Care coordination centered on each resident's own choices, requests, and meaningful moments.",
      },
      { property: "og:title", content: "Staff dashboard — PACE" },
      { property: "og:description", content: "Answer resident requests and plan better moments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StaffMode,
});

type ResidentProfile = {
  id: string;
  display_name: string | null;
  greeting_name: string | null;
  email: string | null;
  staff_notes: string | null;
  preferences: Record<string, unknown> | null;
};

const statusFilters = ["all", "new", "in_progress", "done"] as const;

function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function StaffMode() {
  const [residents, setResidents] = useState<ResidentProfile[]>([]);
  const [events, setEvents] = useState<PaceEvent[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof statusFilters)[number]>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [pinEmail, setPinEmail] = useState("");
  const [pinValue, setPinValue] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const editRef = useRef<HTMLSelectElement | HTMLElement | null>(null);

  const loadResidents = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, greeting_name, email, staff_notes, preferences")
      .order("display_name");
    setResidents((data ?? []) as ResidentProfile[]);
  }, []);

  useEffect(() => {
    void loadResidents();
  }, [loadResidents]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const rows = await listAllEvents();
      if (active) setEvents(rows);
    };
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const nameFor = useCallback(
    (id: string) => {
      const person = residents.find((resident) => resident.id === id);
      return person?.greeting_name || person?.display_name || person?.email || "A resident";
    },
    [residents],
  );

  const visibleResidents = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return residents;
    return residents.filter((resident) =>
      `${resident.display_name ?? ""} ${resident.greeting_name ?? ""} ${resident.email ?? ""}`
        .toLowerCase()
        .includes(needle),
    );
  }, [residents, query]);

  const requests = events.filter((event) => event.kind !== "activity");
  const visibleRequests = filter === "all" ? requests : requests.filter((event) => event.status === filter);

  const today = new Date().toDateString();
  const todaysActivity = events.filter((event) => new Date(event.created_at).toDateString() === today);

  const selected = residents.find((resident) => resident.id === selectedId) ?? null;

  const updateStatus = async (id: string, status: PaceEvent["status"]) => {
    await setEventStatus(id, status);
    setEvents((current) => current.map((event) => (event.id === id ? { ...event, status } : event)));
  };

  const saveResident = async () => {
    if (!selected) return;
    const { error } = await supabase
      .from("profiles")
      .update({ greeting_name: nameDraft.trim(), staff_notes: noteDraft.trim() || null })
      .eq("id", selected.id);
    if (error) {
      setSaveMessage("Could not save. Please try again.");
      return;
    }
    setSaveMessage("Saved.");
    window.setTimeout(() => setSaveMessage(""), 4000);
    void loadResidents();
  };

  const savePin = async () => {
    const result = await setResidentPin({
      data: { email: pinEmail.trim(), pin: pinValue.trim() === "" ? null : pinValue.trim() },
    });
    setPinMessage(result.message);
  };

  return (
    <div className="staff-page">
      <header className="staff-header">
        <h1>Resident overview</h1>
        <p>
          Everything here comes from what residents chose themselves. Names and notes in this
          demonstration are fictional.
        </p>
      </header>

      <section className="staff-card" aria-labelledby="queue-heading">
        <h2 id="queue-heading">
          <LifeBuoy aria-hidden /> Requests from residents
        </h2>
        <div className="staff-filters" role="group" aria-label="Filter requests">
          {statusFilters.map((option) => (
            <Button
              key={option}
              size="sm"
              variant={filter === option ? "default" : "outline"}
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
            >
              {option === "all" ? "All" : option === "in_progress" ? "In progress" : option === "new" ? "New" : "Done"}
            </Button>
          ))}
        </div>
        {visibleRequests.length === 0 && <p className="simple-note">No requests right now.</p>}
        <ul className="staff-queue">
          {visibleRequests.map((event) => (
            <li key={event.id}>
              <div>
                <strong>{nameFor(event.resident_id)}</strong>
                <span>{event.label}</span>
                <small>
                  {event.kind === "help" ? "Needs help" : "Choice"} ·{" "}
                  {new Date(event.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </small>
              </div>
              <div className="staff-queue-actions">
                <Button
                  size="sm"
                  variant={event.status === "in_progress" ? "default" : "outline"}
                  onClick={() => void updateStatus(event.id, "in_progress")}
                >
                  <Timer aria-hidden /> In progress
                </Button>
                <Button
                  size="sm"
                  variant={event.status === "done" ? "default" : "outline"}
                  onClick={() => void updateStatus(event.id, "done")}
                >
                  <CheckCircle2 aria-hidden /> Done
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="staff-card" aria-labelledby="residents-heading">
        <h2 id="residents-heading">
          <Users aria-hidden /> Residents
        </h2>
        <label className="staff-search" htmlFor="resident-search">
          <Search aria-hidden />
          <span className="sr-only">Search residents</span>
          <Input
            id="resident-search"
            placeholder="Search by name or email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <ul className="staff-resident-list">
          {visibleResidents.map((resident) => {
            const preferences = (resident.preferences ?? {}) as Record<string, unknown>;
            const recent = events
              .filter((event) => event.resident_id === resident.id)
              .slice(0, 3)
              .map((event) => event.label);
            return (
              <li key={resident.id}>
                <div>
                  <strong>{resident.greeting_name || resident.display_name || resident.email}</strong>
                  <small>
                    Enjoys: {[...asList(preferences['music']), ...asList(preferences['interests'])].join(", ") || "Not set yet"}
                  </small>
                  <small>Recent choices: {recent.join(" · ") || "None yet"}</small>
                  {resident.staff_notes && <small>Note: {resident.staff_notes}</small>}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedId(resident.id);
                    setNameDraft(resident.greeting_name ?? "");
                    setNoteDraft(resident.staff_notes ?? "");
                    setSaveMessage("");
                    window.setTimeout(() => {
                      (editRef.current as HTMLElement | null)?.scrollIntoView({ behavior: "smooth", block: "center" });
                      document.getElementById("resident-name")?.focus();
                    }, 60);
                  }}
                >
                  <ClipboardPen aria-hidden /> Edit
                </Button>
              </li>
            );
          })}
        </ul>
      </section>

      {selected && (
        <section
          className="staff-card"
          aria-labelledby="edit-heading"
          ref={(node) => {
            editRef.current = node;
          }}
        >
          <h2 id="edit-heading">Edit {selected.display_name || selected.email}</h2>
          <label htmlFor="resident-name">Preferred name</label>
          <Input id="resident-name" value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} />
          <label htmlFor="resident-note">Care note</label>
          <textarea
            id="resident-note"
            className="staff-textarea"
            rows={3}
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
          />
          <div className="staff-queue-actions">
            <Button onClick={() => void saveResident()}>Save</Button>
            <Button variant="outline" onClick={() => setSelectedId(null)}>
              Close
            </Button>
          </div>
          {saveMessage && <p className="simple-note">{saveMessage}</p>}
        </section>
      )}

      <section className="staff-card" aria-labelledby="log-heading">
        <h2 id="log-heading">What residents chose today</h2>
        {todaysActivity.length === 0 && <p className="simple-note">Nothing recorded yet today.</p>}
        <ul className="staff-log">
          {todaysActivity.map((event) => (
            <li key={event.id}>
              <span>{new Date(event.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
              <strong>{nameFor(event.resident_id)}</strong>
              <span>{event.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="staff-card" aria-labelledby="pin-heading">
        <h2 id="pin-heading">Resident sign-in PIN</h2>
        <p className="simple-note">
          Set a 4-digit PIN so a resident can sign in without email. Leave the PIN empty to remove it.
        </p>
        <label htmlFor="pin-email">Resident email</label>
        <Input id="pin-email" type="email" value={pinEmail} onChange={(event) => setPinEmail(event.target.value)} />
        <label htmlFor="pin-value">4-digit PIN</label>
        <Input
          id="pin-value"
          inputMode="numeric"
          maxLength={4}
          value={pinValue}
          onChange={(event) => setPinValue(event.target.value.replace(/\D/g, "").slice(0, 4))}
        />
        <Button onClick={() => void savePin()} disabled={!pinEmail.trim()}>
          Save PIN
        </Button>
        {pinMessage && <p className="simple-note">{pinMessage}</p>}
      </section>
    </div>
  );
}
