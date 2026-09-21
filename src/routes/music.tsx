import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Heart, Music2, Pause, Play, Search, Square } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLumaStrideWellness, type MusicFavorite } from "@/lib/lumastride-wellness";
import { pauseSong, playSong, stopSong } from "@/lib/music-player";
import { ExperienceFeedback } from "@/components/pace/ExperienceFeedback";

export const Route = createFileRoute("/music")({
  head: () => ({
    meta: [
      { title: "Listen — PACE" },
      { name: "description", content: "Choose familiar music and save what you enjoy." },
      { property: "og:title", content: "Listen — PACE" },
      {
        property: "og:description",
        content: "A simple, familiar music experience for older adults.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Music,
});

const catalog: MusicFavorite[] = [
  {
    id: "golden-hour",
    title: "Golden Hour Walk",
    artist: "Harbor Lights",
    genre: "Easy Listening",
    bpm: 80,
    enjoyment: 5,
  },
  {
    id: "garden-path",
    title: "Garden Path",
    artist: "Morning Ensemble",
    genre: "Instrumental",
    bpm: 84,
    enjoyment: 4,
  },
  {
    id: "steady-heart",
    title: "Steady Heart",
    artist: "The Kindred",
    genre: "Classic Pop",
    bpm: 92,
    enjoyment: 5,
  },
  {
    id: "blue-skies",
    title: "Blue Skies Ahead",
    artist: "Sunday Social",
    genre: "Jazz",
    bpm: 76,
    enjoyment: 4,
  },
];

function Music() {
  const state = useLumaStrideWellness();
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const selected = catalog.find((song) => song.id === playing) ?? null;
  const target = state.targetCadence ?? state.cadence;
  const results = useMemo(
    () =>
      catalog.filter((song) =>
        `${song.title} ${song.artist} ${song.genre}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="simple-page wide">
      <Link to="/" className="simple-back">
        <ChevronLeft /> Home
      </Link>
      <header className="simple-heading">
        <Music2 className="simple-page-icon" />
        <div>
          <p className="eyebrow">Listen</p>
          <h1>What would you like to hear?</h1>
          <p>Choose something familiar, or try something new.</p>
        </div>
      </header>
      <section className="music-player" aria-label="Music controls">
        <p aria-live="polite">
          {selected ? `${isPlaying ? "Now playing" : "Selected"}: ${selected.title}` : "Choose a song below"}
        </p>
        <div className="activity-actions">
          <Button
            size="xl"
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              setIsPlaying(true);
              void playSong(selected.id, selected.bpm ?? 80).catch(() => setIsPlaying(false));
            }}
          >
            <Play />
            Play
          </Button>
          <Button
            size="xl"
            variant="outline"
            disabled={!selected || !isPlaying}
            onClick={() => {
              setIsPlaying(false);
              void pauseSong();
            }}
          >
            <Pause />
            Pause
          </Button>
          <Button
            size="xl"
            variant="outline"
            disabled={!selected}
            onClick={() => {
              stopSong();
              setIsPlaying(false);
              setPlaying(null);
            }}
          >
            <Square />
            Stop
          </Button>
        </div>
      </section>
      <section className="music-search">
        <h2>Find a song</h2>
        <div className="search-box">
          <Search />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Song, artist, or genre"
            aria-label="Search songs"
          />
        </div>
        <div className="song-list">
          {results.map((song) => (
            <SongRow
              key={song.id}
              song={song}
              target={target}
              favorite={state.favoriteSongs.some((item) => item.id === song.id)}
              toggle={() => state.toggleSong(song)}
              choose={() => {
                stopSong();
                setIsPlaying(false);
                setPlaying(song.id);
                void playSong(song.id, song.bpm ?? 80)
                  .then(() => setIsPlaying(true))
                  .catch(() => {});
              }}
            />
          ))}
        </div>
      </section>
      <MusicGroup icon={<Heart />} title="Favorite songs" songs={state.favoriteSongs} />
      <details className="advanced-rhythm">
        <summary>Music library settings</summary>
        <section className="music-settings" aria-label="Music preferences">
          <label>
            Music service or library
            <select
              value={state.musicService}
              onChange={(event) => state.setMusicService(event.target.value)}
            >
              <option>None selected</option>
              <option>Apple Music</option>
              <option>Spotify</option>
              <option>YouTube Music</option>
              <option>My device library</option>
            </select>
          </label>
          <p>
            Connections depend on services available on your device. PACE does not download or
            redistribute songs.
          </p>
        </section>
      </details>
      {playing && <ExperienceFeedback choice="Listen" title={playing} />}
      <p className="observation-note">PACE remembers only the music you choose to save.</p>
    </div>
  );
}

function matchLabel(bpm: number | null, target: number | null) {
  if (!bpm || !target) return "Tempo not available";
  const difference = Math.abs(bpm - target);
  return difference <= 3
    ? "Great rhythm match"
    : difference <= 8
      ? "Close rhythm match"
      : "Different rhythm";
}

function SongRow({
  song,
  target,
  favorite,
  toggle,
  choose,
}: {
  song: MusicFavorite;
  target: number | null;
  favorite: boolean;
  toggle: () => void;
  choose: () => void;
}) {
  return (
    <article className="song-row">
      <div>
        <h3>{song.title}</h3>
        <p>
          {song.artist} · {song.genre}
        </p>
        <b className="advanced-only">{matchLabel(song.bpm, target)}</b>
      </div>
      <div className="activity-actions">
        <Button size="lg" onClick={choose}>
          Choose
        </Button>
        <Button
          size="iconLg"
          variant={favorite ? "amber" : "outline"}
          onClick={toggle}
          aria-label={`${favorite ? "Remove" : "Add"} ${song.title} ${favorite ? "from" : "to"} favorites`}
        >
          <Heart className={favorite ? "fill-current" : ""} />
        </Button>
      </div>
    </article>
  );
}

function MusicGroup({
  icon,
  title,
  songs,
}: {
  icon: ReactNode;
  title: string;
  songs: MusicFavorite[];
}) {
  return (
    <section className="music-group">
      <h2>
        {icon}
        {title}
      </h2>
      {songs.length ? (
        songs.map((song) => (
          <p key={song.id}>
            <strong>{song.title}</strong>
            <span>{song.artist}</span>
          </p>
        ))
      ) : (
        <p className="empty-music">Nothing saved here yet.</p>
      )}
    </section>
  );
}
