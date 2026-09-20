import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Heart, Music2, Search, Star } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLumaStrideWellness, type MusicFavorite } from "@/lib/lumastride-wellness";

export const Route = createFileRoute("/music")({
  head: () => ({ meta: [
    { title: "Optional Music — PACE" },
    { name: "description", content: "Save music you enjoy and find songs close to your walking rhythm." },
    { property: "og:title", content: "Optional Music — PACE" },
    { property: "og:description", content: "Personalized music and rhythm support for movement practice." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Music,
});

const catalog: MusicFavorite[] = [
  { id: "golden-hour", title: "Golden Hour Walk", artist: "Harbor Lights", genre: "Easy Listening", bpm: 80, enjoyment: 5 },
  { id: "garden-path", title: "Garden Path", artist: "Morning Ensemble", genre: "Instrumental", bpm: 84, enjoyment: 4 },
  { id: "steady-heart", title: "Steady Heart", artist: "The Kindred", genre: "Classic Pop", bpm: 92, enjoyment: 5 },
  { id: "blue-skies", title: "Blue Skies Ahead", artist: "Sunday Social", genre: "Jazz", bpm: 76, enjoyment: 4 },
];

function Music() {
  const state = useLumaStrideWellness();
  const [query, setQuery] = useState("");
  const [targetText, setTargetText] = useState(state.targetCadence?.toString() ?? "");
  const target = state.targetCadence ?? state.cadence;
  const results = useMemo(() => catalog.filter((song) => `${song.title} ${song.artist} ${song.genre}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const matching = catalog.filter((song) => target && song.bpm && Math.abs(song.bpm - target) <= 8);

  return <div className="simple-page wide">
    <Link to="/" className="simple-back"><ChevronLeft /> Home</Link>
    <header className="simple-heading"><Music2 className="simple-page-icon"/><div><h1>My Music</h1><p>Personalized music and rhythm support for movement practice.</p></div></header>
    <section className="music-settings" aria-label="Music preferences">
      <label>Music service or library<select value={state.musicService} onChange={(event) => state.setMusicService(event.target.value)}><option>None selected</option><option>Apple Music</option><option>Spotify</option><option>YouTube Music</option><option>My device library</option></select></label>
      <p>Connections depend on services available on your device. PACE does not download or redistribute songs.</p>
    </section>
    <section className="music-search">
      <h2>Find a song</h2><div className="search-box"><Search/><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Song, artist, or genre" aria-label="Search songs"/></div>
      <div className="song-list">{results.map((song) => <SongRow key={song.id} song={song} target={target} favorite={state.favoriteSongs.some((item) => item.id === song.id)} toggle={() => state.toggleSong(song)}/>)}</div>
    </section>
    <section className="music-grid">
      <MusicGroup icon={<Heart/>} title="Favorite songs" songs={state.favoriteSongs}/>
      <MusicGroup icon={<Music2/>} title="Songs that match my rhythm" songs={matching}/>
      <MusicGroup icon={<Star/>} title="Songs I enjoy most" songs={state.favoriteSongs.filter((song) => song.enjoyment === 5)}/>
    </section>
    <section className="therapist-setting">
      <h2>Rhythm set with a therapist</h2>
      <p>A clinician or qualified therapist can set a personal practice rhythm. No single BPM is right for everyone.</p>
      <div><Input inputMode="numeric" value={targetText} onChange={(event) => setTargetText(event.target.value)} placeholder="Steps per minute" aria-label="Therapist target rhythm"/><Button variant="outline" size="xl" onClick={() => { const value = Number(targetText); state.setTargetCadence(Number.isFinite(value) && value > 0 ? value : null); }}>Save rhythm</Button></div>
    </section>
  </div>;
}

function matchLabel(bpm: number | null, target: number | null) {
  if (!bpm || !target) return "Tempo not available";
  const difference = Math.abs(bpm - target);
  return difference <= 3 ? "Great rhythm match" : difference <= 8 ? "Close rhythm match" : "Different rhythm";
}

function SongRow({ song, target, favorite, toggle }: { song: MusicFavorite; target: number | null; favorite: boolean; toggle: () => void }) {
  return <article className="song-row"><div><h3>{song.title}</h3><p>{song.artist} · {song.genre} · {song.bpm ? `${song.bpm} BPM` : "Tempo unavailable"}</p><b>{matchLabel(song.bpm, target)}</b></div><Button size="iconLg" variant={favorite ? "amber" : "outline"} onClick={toggle} aria-label={`${favorite ? "Remove" : "Add"} ${song.title} ${favorite ? "from" : "to"} favorites`}><Heart className={favorite ? "fill-current" : ""}/></Button></article>;
}

function MusicGroup({ icon, title, songs }: { icon: ReactNode; title: string; songs: MusicFavorite[] }) {
  return <section className="music-group"><h2>{icon}{title}</h2>{songs.length ? songs.map((song) => <p key={song.id}><strong>{song.title}</strong><span>{song.artist}</span></p>) : <p className="empty-music">Nothing saved here yet.</p>}</section>;
}