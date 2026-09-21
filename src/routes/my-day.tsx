import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, ChevronLeft, ChevronRight, Headphones, Leaf, MessageCircleHeart, Moon, Music, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SeniorControls } from "@/components/pace/SeniorControls";
import { usePaceAuth } from "@/lib/pace-auth";
import { recordEvent } from "@/lib/pace-events";

export const Route = createFileRoute("/my-day")({
  head: () => ({
    meta: [
      { title: "My Day — PACE" },
      {
        name: "description",
        content: "Your daily schedule, calendar, reminders, and simple profile in PACE.",
      },
      { property: "og:title", content: "My Day — PACE" },
      { property: "og:description", content: "Today's schedule and reminders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyDayPage,
});

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type ScheduleItem = {
  id: string;
  timeLabel: string;
  hour: number;
  title: string;
  detail: string;
  route: "/listen" | "/connect" | "/explore" | "/quiet";
  tone: "listen" | "connect" | "explore" | "quiet";
  Icon: typeof Headphones;
};

function buildSchedule(music: string[], people: { name: string }[], interests: string[]): ScheduleItem[] {
  const firstGenre = music[0] ?? "music you love";
  const firstPerson = people[0]?.name ?? "someone you care about";
  const firstInterest = interests[0] ?? "something meaningful";
  return [
    {
      id: "morning-listen",
      timeLabel: "9:00 AM",
      hour: 9,
      title: "Listen",
      detail: firstGenre ? `Enjoy some ${firstGenre.toLowerCase()}` : "Enjoy music you love",
      route: "/listen",
      tone: "listen",
      Icon: Headphones,
    },
    {
      id: "midday-connect",
      timeLabel: "11:00 AM",
      hour: 11,
      title: "Connect",
      detail: `Say hello to ${firstPerson}`,
      route: "/connect",
      tone: "connect",
      Icon: MessageCircleHeart,
    },
    {
      id: "afternoon-explore",
      timeLabel: "2:00 PM",
      hour: 14,
      title: "Explore",
      detail: `Spend time with ${firstInterest.toLowerCase()}`,
      route: "/explore",
      tone: "explore",
      Icon: Leaf,
    },
    {
      id: "late-movement",
      timeLabel: "4:00 PM",
      hour: 16,
      title: "Gentle movement",
      detail: "A comfortable seated stretch",
      route: "/explore",
      tone: "explore",
      Icon: Music,
    },
    {
      id: "evening-quiet",
      timeLabel: "7:00 PM",
      hour: 19,
      title: "Quiet time",
      detail: "Rest and unwind",
      route: "/quiet",
      tone: "quiet",
      Icon: Moon,
    },
  ];
}

function calendarGrid(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return { year, month, days, monthName: firstDay.toLocaleString("en-US", { month: "long" }) };
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function MyDayPage() {
  const navigate = useNavigate();
  const { loading, session, user, profile, preferences } = usePaceAuth();
  const [today] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [spoken, setSpoken] = useState(false);

  useEffect(() => {
    if (loading || !session || !profile || preferences.onboarded) return;
    void navigate({ to: "/onboarding", replace: true });
  }, [loading, session, profile, preferences.onboarded, navigate]);

  const greeting = useMemo(() => greetingFor(today.getHours()), [today]);
  const schedule = useMemo(
    () => buildSchedule(preferences.music, preferences.people, preferences.interests),
    [preferences.music, preferences.people, preferences.interests],
  );

  useEffect(() => {
    if (!user?.id || spoken) return;
    setSpoken(true);
    void recordEvent({ residentId: user.id, kind: "activity", label: "Opened My Day" });
  }, [user?.id, spoken]);

  const reminders = useMemo(() => {
    const currentHour = today.getHours();
    return schedule.filter((item) => item.hour >= currentHour);
  }, [schedule, today]);

  const { year, month, days, monthName } = calendarGrid(selectedDate);

  const changeMonth = (delta: number) => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + delta);
    setSelectedDate(next);
  };

  const name = profile?.greeting_name || profile?.display_name || "friend";

  const openItem = (item: ScheduleItem) => {
    if (user?.id) {
      void recordEvent({ residentId: user.id, kind: "choice", label: `My Day: ${item.title}` });
    }
    void navigate({ to: item.route });
  };

  return (
    <div className="simple-page my-day-page">
      <SeniorControls />

      <section className="my-day-profile" aria-label="My profile">
        <div className="my-day-avatar" aria-hidden>
          <UserRound />
        </div>
        <div>
          <h1 className="my-day-greeting">
            {greeting}, {name}
          </h1>
          <p className="my-day-date">{today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <Button size="xl" variant="outline" asChild className="my-day-edit-profile">
          <Link to="/settings">Edit my profile</Link>
        </Button>
      </section>

      <section className="my-day-calendar" aria-label="Calendar">
        <div className="my-day-calendar-header">
          <Button size="iconLg" variant="ghost" onClick={() => changeMonth(-1)} aria-label="Previous month">
            <ChevronLeft />
          </Button>
          <h2>
            {monthName} {year}
          </h2>
          <Button size="iconLg" variant="ghost" onClick={() => changeMonth(1)} aria-label="Next month">
            <ChevronRight />
          </Button>
        </div>
        <div className="my-day-weekdays" aria-hidden>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="my-day-days" role="grid">
          {days.map((day, idx) => {
            if (!day) return <span key={`blank-${idx}`} className="my-day-day my-day-day-empty" />;
            const date = new Date(year, month, day);
            const selected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(date)}
                className={`my-day-day${selected ? " my-day-day-selected" : ""}${isToday ? " my-day-day-today" : ""}`}
                aria-label={`${monthName} ${day}`}
                aria-current={isToday ? "date" : undefined}
                aria-pressed={selected}
              >
                {day}
              </button>
            );
          })}
        </div>
      </section>

      <section className="my-day-schedule" aria-labelledby="schedule-heading">
        <h2 id="schedule-heading" className="my-day-section-title">
          <CalendarDays aria-hidden /> Schedule for {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </h2>
        {schedule.length === 0 ? (
          <p className="simple-note">No schedule yet.</p>
        ) : (
          <ul className="my-day-list">
            {schedule.map((item) => (
              <li key={item.id}>
                <button
                  className={`my-day-card my-day-card-${item.tone}`}
                  onClick={() => openItem(item)}
                  aria-label={`${item.title}. ${item.detail} at ${item.timeLabel}`}
                >
                  <span className="my-day-time">{item.timeLabel}</span>
                  <span className="my-day-card-title">
                    <item.Icon aria-hidden /> {item.title}
                  </span>
                  <span className="my-day-card-detail">{item.detail}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="my-day-reminders" aria-labelledby="reminders-heading">
        <h2 id="reminders-heading" className="my-day-section-title">
          Up next today
        </h2>
        {reminders.length === 0 ? (
          <p className="simple-note">Nothing else planned for today. Enjoy your evening.</p>
        ) : (
          <ul className="my-day-list">
            {reminders.slice(0, 3).map((item) => (
              <li key={`reminder-${item.id}`}>
                <button className={`my-day-card my-day-card-${item.tone}`} onClick={() => openItem(item)} aria-label={`${item.title} at ${item.timeLabel}`}>
                  <span className="my-day-time">{item.timeLabel}</span>
                  <span className="my-day-card-title">
                    <item.Icon aria-hidden /> {item.title}
                  </span>
                  <span className="my-day-card-detail">{item.detail}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="my-day-profile-card" aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="my-day-section-title">
          My simple profile
        </h2>
        <dl className="my-day-dl">
          <div>
            <dt>Name</dt>
            <dd>{profile?.display_name || name}</dd>
          </div>
          <div>
            <dt>Favorite music</dt>
            <dd>{preferences.music.length ? preferences.music.join(", ") : "Not set yet"}</dd>
          </div>
          <div>
            <dt>People I care about</dt>
            <dd>{preferences.people.length ? preferences.people.map((p) => p.name).join(", ") : "Not set yet"}</dd>
          </div>
          <div>
            <dt>Things I enjoy</dt>
            <dd>{preferences.interests.length ? preferences.interests.join(", ") : "Not set yet"}</dd>
          </div>
        </dl>
        <Button size="xl" variant="outline" asChild className="my-day-edit-profile">
          <Link to="/settings">Edit my profile</Link>
        </Button>
      </section>
    </div>
  );
}
