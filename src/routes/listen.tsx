import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Music2, Pause, Play, Search, Shuffle, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActivityShell } from "@/components/pace/ActivityShell";
import { ExperienceFeedback } from "@/components/pace/ExperienceFeedback";
import { usePaceAuth } from "@/lib/pace-auth";
import { useActivityActions } from "@/lib/pace-activity";
import {
  DECADE_CHOICES,
  decadeFromBirthYear,
  loadMusicItems,
  loadMusicProfile,
  logMusicPlay,
  playDemoTone,
  recentPlayIds,
  saveMusicDecade,
  searchUrl,
  setDemoVolume,
  stopDemoTone,
  type MusicItem,
} from "@/lib/music-catalog";

export const Route = createFileRoute("/listen")({
  head: () => ({
    meta: [
      { title: "Listen — PACE" },
      { name: "description", content: "Songs from your years, your favourite kinds of music, and sing-alongs." },
      { property: "og:title", content: "Listen — PACE" },
      {
        property: "og:description",
        content: "A simple, familiar music page for older adults, with big buttons and sing-along words.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Listen,
});

type View =
  | { kind: "home" }
  | { kind: "list"; title: string; items: MusicItem[] }
  | { kind: "lyrics"; item: MusicItem };

const TEXT_SIZES = [
  { label: "A", size: 2 },
  { label: "A+", size: 2.6 },
  { label: "A++", size: 3.2 },
];

function Listen() {
  const navigate = useNavigate();
  const { user, profile, loading } = usePaceAuth();
  const { status, setStatus, announce, askStaff, logActivity, who } = useActivityActions("Listen");

  const [items, setItems] = useState<MusicItem[]>([]);
  const [decade, setDecade] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [askDecade, setAskDecade] = useState(false);
  const [view, setView] = useState<View>({ kind: "home" });
  const [surprise, setSurprise] = useState<MusicItem | null>(null);
  const [nowPlaying, setNowPlaying] = useState<MusicItem | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.12);
  const [lyricSize, setLyricSize] = useState(2);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const list = await loadMusicItems();
      if (!active) return;
      setItems(list);
      if (!user?.id) return;
      const music = await loadMusicProfile(user.id);
      if (!active) return;
      setGenres(music.favorite_genres);
      const found = music.music_decade ?? decadeFromBirthYear(music.birth_year);
      setDecade(found);
      setAskDecade(!found);
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => stopDemoTone, []);

  const decadeItems = useMemo(
    () => items.filter((item) => item.decade === decade),
    [items, decade],
  );
  const singAlong = useMemo(
    () => items.filter((item) => item.source_type === "public_domain_lyrics"),
    [items],
  );
  const demoItems = useMemo(
    () => items.filter((item) => item.source_type === "demo_audio"),
    [items],
  );

  const chooseDecade = async (value: string) => {
    setDecade(value);
    setAskDecade(false);
    announce(`Saved. I will show you songs from the ${value}.`);
    if (user?.id) await saveMusicDecade(user.id, value);
  };

  const startDemo = useCallback(
    (item: MusicItem) => {
      stopDemoTone();
      const ok = playDemoTone(volume);
      setNowPlaying(item);
      setPlaying(ok);
      if (ok) announce(`Playing ${item.title}.`);
      else setStatus("Tap Play to start.");
      logActivity(`Played ${item.title}`);
      if (user?.id) void logMusicPlay(user.id, item.id, "played");
    },
    [volume, announce, setStatus, logActivity, user?.id],
  );

  const findSong = (item: MusicItem) => {
    window.open(searchUrl(item), "_blank", "noopener,noreferrer");
    announce(`Looking for ${item.title}.`);
    logActivity(`Looked for ${item.title}`);
    if (user?.id) void logMusicPlay(user.id, item.id, "searched");
  };

  const requestSong = (item: MusicItem) => {
    askStaff(
      `would like to hear ${item.title}${item.artist ? ` by ${item.artist}` : ""}`,
      "Staff have been told. Someone will help you soon.",
    );
    if (user?.id) void logMusicPlay(user.id, item.id, "asked_staff");
  };

  const pickSurprise = async () => {
    const pool = items.filter(
      (item) => item.decade === decade || (item.genre && genres.includes(item.genre)),
    );
    const recent = user?.id ? await recentPlayIds(user.id, 10) : [];
    const fresh = pool.filter((item) => !recent.includes(item.id));
    const choices = fresh.length ? fresh : pool;
    const pick = choices[Math.floor(Math.random() * choices.length)] ?? null;
    setSurprise(pick);
    if (pick) {
      announce(`How about ${pick.title}${pick.artist ? ` by ${pick.artist}` : ""}?`);
      if (user?.id) void logMusicPlay(user.id, pick.id, "surprise");
    } else {
      setStatus("No songs here yet. Ask staff to add some.");
    }
  };

  const openList = (title: string, list: MusicItem[]) => {
    setView({ kind: "list", title, items: list });
    announce(title);
  };

  const lead =
    view.kind === "home"
      ? "Pick the music you feel like hearing today."
      : "Tap a song to hear it, find it, or ask staff to play it.";

  return (
    <ActivityShell activity="Listen" eyebrow="Listen" title="Music I enjoy" lead={lead} status={status}>
      {view.kind !== "home" && (
        <Button size="xl" variant="outline" onClick={() => setView({ kind: "home" })}>
          <ArrowLeft aria-hidden />
          Back to music choices
        </Button>
      )}

      {view.kind === "home" && (
        <>
          <section className="music-block" aria-label="Songs from when I was 20">
            <h2>Songs from when I was 20</h2>
            {askDecade ? (
              <>
                <p>Which years did you love music from?</p>
                <div className="music-choice-grid">
                  {DECADE_CHOICES.map((choice) => (
                    <Button key={choice} size="xl" onClick={() => void chooseDecade(choice)}>
                      {choice}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <Button
                size="xl"
                className="music-big-card"
                onClick={() =>
                  decadeItems.length
                    ? openList(`Songs from the ${decade}`, decadeItems)
                    : askStaff(`would like music from the ${decade}`)
                }
              >
                <Music2 aria-hidden />
                Songs from the {decade ?? "years you loved"}
              </Button>
            )}
          </section>

          <section className="music-block" aria-label="My favourite kinds of music">
            <h2>My favourite kinds of music</h2>
            {genres.length === 0 ? (
              <>
                <p>No favourite kinds saved yet.</p>
                <Button size="xl" variant="outline" onClick={() => askStaff("would like help choosing music they love")}>
                  Ask staff
                </Button>
              </>
            ) : (
              <div className="music-choice-grid">
                {genres.map((genre) => {
                  const list = items.filter((item) => item.genre === genre);
                  return (
                    <Button
                      key={genre}
                      size="xl"
                      className="music-big-card"
                      onClick={() =>
                        list.length
                          ? openList(genre, list)
                          : announce("No songs here yet. Ask staff to add some.")
                      }
                    >
                      {genre}
                    </Button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="music-block" aria-label="Surprise me">
            <h2>Surprise me</h2>
            {surprise ? (
              <article className="song-row">
                <div>
                  <h3>{surprise.title}</h3>
                  <p>
                    {[surprise.artist, surprise.year].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="activity-actions">
                  <Button
                    size="lg"
                    onClick={() =>
                      surprise.source_type === "demo_audio"
                        ? startDemo(surprise)
                        : surprise.source_type === "public_domain_lyrics"
                          ? setView({ kind: "lyrics", item: surprise })
                          : findSong(surprise)
                    }
                  >
                    <Play aria-hidden />
                    Play or find it
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => void pickSurprise()}>
                    <Shuffle aria-hidden />
                    Another surprise
                  </Button>
                </div>
              </article>
            ) : (
              <Button size="xl" className="music-big-card" onClick={() => void pickSurprise()}>
                <Sparkles aria-hidden />
                Surprise me
              </Button>
            )}
          </section>

          <section className="music-block" aria-label="Sing along">
            <h2>Sing along</h2>
            <div className="song-list">
              {singAlong.map((item) => (
                <article key={item.id} className="song-row">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{[item.artist, item.genre].filter(Boolean).join(" · ")}</p>
                  </div>
                  <Button size="lg" onClick={() => setView({ kind: "lyrics", item })}>
                    Sing along
                  </Button>
                </article>
              ))}
            </div>
          </section>

          <section className="music-block" aria-label="Gentle demo music">
            <h2>Gentle music made for PACE</h2>
            <div className="song-list">
              {demoItems.map((item) => (
                <article key={item.id} className="song-row">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.genre} · Demo tone</p>
                  </div>
                  <Button size="lg" onClick={() => startDemo(item)}>
                    <Play aria-hidden />
                    Play
                  </Button>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {view.kind === "list" && (
        <section className="music-block" aria-label={view.title}>
          <h2>{view.title}</h2>
          {view.items.length === 0 ? (
            <>
              <p>No songs here yet. Ask staff to add some.</p>
              <Button size="xl" variant="outline" onClick={() => askStaff("would like more songs added")}>
                Ask staff
              </Button>
            </>
          ) : (
            <div className="song-list">
              {view.items.map((item) => (
                <article key={item.id} className="song-row">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{[item.artist, item.year, item.genre].filter(Boolean).join(" · ")}</p>
                  </div>
                  <div className="activity-actions">
                    {item.source_type === "reference" && (
                      <>
                        <Button size="lg" onClick={() => findSong(item)}>
                          <Search aria-hidden />
                          Find this song
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => requestSong(item)}>
                          Ask staff to play this
                        </Button>
                      </>
                    )}
                    {item.source_type === "demo_audio" && (
                      <Button size="lg" onClick={() => startDemo(item)}>
                        <Play aria-hidden />
                        Play demo tone
                      </Button>
                    )}
                    {item.source_type === "public_domain_lyrics" && (
                      <Button size="lg" onClick={() => setView({ kind: "lyrics", item })}>
                        Sing along
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {view.kind === "lyrics" && (
        <section className="music-block sing-along" aria-label={`Words for ${view.item.title}`}>
          <h2>{view.item.title}</h2>
          <div className="activity-actions">
            {TEXT_SIZES.map((choice) => (
              <Button
                key={choice.label}
                size="lg"
                variant={lyricSize === choice.size ? "default" : "outline"}
                onClick={() => setLyricSize(choice.size)}
                aria-label={`Text size ${choice.label}`}
              >
                {choice.label}
              </Button>
            ))}
            <Button size="lg" variant="outline" onClick={() => startDemo(view.item)}>
              <Play aria-hidden />
              Demo tone
            </Button>
          </div>
          <pre className="lyrics" style={{ fontSize: `${lyricSize}rem` }}>
            {view.item.lyrics}
          </pre>
        </section>
      )}

      {nowPlaying && (
        <section className="now-playing" aria-label="Now playing">
          <p>
            <strong>Now playing:</strong> {nowPlaying.title}
          </p>
          <div className="activity-actions">
            <Button
              size="lg"
              onClick={() => {
                if (playing) {
                  stopDemoTone();
                  setPlaying(false);
                } else {
                  setPlaying(playDemoTone(volume));
                }
              }}
            >
              {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
              {playing ? "Pause" : "Play"}
            </Button>
          </div>
          <label className="volume-control">
            Volume
            <input
              type="range"
              min={0}
              max={30}
              value={Math.round(volume * 100)}
              aria-label="Music volume"
              onChange={(event) => {
                const next = Number(event.target.value) / 100;
                setVolume(next);
                setDemoVolume(next);
              }}
            />
          </label>
        </section>
      )}

      {nowPlaying && <ExperienceFeedback choice="Listen" title={nowPlaying.title} />}
      <p className="observation-note">
        PACE shows song titles only and never plays copyrighted recordings. Sing-along words are
        public domain. {who} chooses everything here.
      </p>
    </ActivityShell>
  );
}
