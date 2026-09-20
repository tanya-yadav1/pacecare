import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Heart, Music2, Pause, Play, Search, Square } from "lucide-react";
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
  const [playing, setPlaying] = useState<string | null>(null);
  const target = state.targetCadence ?? state.cadence;
  const results = useMemo(() => catalog.filter((song) => `${song.title} ${song.artist} ${song.genre}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const matching = catalog.filter((song) => target && song.bpm && Math.abs(song.bpm - target) <= 8);

  return <div className="simple-page wide">
    <Link to="/" className="simple-back"><ChevronLeft /> Home</Link>
    <header className="simple-heading"><Music2 className="simple-page-icon"/><div><h1>Optional Music</h1><p>Choose music you enjoy for movement or relaxation.</p></div></header>
    <section className="music-player" aria-label="Music controls"><p>{playing ? `Selected: ${playing}` : "Choose a song below"}</p><div className="activity-actions"><Button size="xl" disabled={!playing}><Play/>Play</Button><Button size="xl" variant="outline" disabled={!playing}><Pause/>Pause</Button><Button size="xl" variant="outline" disabled={!playing} onClick={() => setPlaying(null)}><Square/>Stop</Button></div></section>
    <section className="music-search">
      <h2>Find a song</h2><div className="search-box"><Search/><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Song, artist, or genre" aria-label="Search songs"/></div>
      <div className="song-list">{results.map((song) => <SongRow key={song.id} song={song} target={target} favorite={state.favoriteSongs.some((item) => item.id === song.id)} toggle={() => state.toggleSong(song)} choose={() => setPlaying(song.title)}/>)}</div>
    </section>
    <MusicGroup icon={<Heart/>} title="Favorite songs" songs={state.favoriteSongs}/>
    <details className="advanced-rhythm"><summary>Advanced rhythm settings</summary><section className="music-settings" aria-label="Music preferences"><label>Music service or library<select value={state.musicService} onChange={(event) => state.setMusicService(event.target.value)}><option>None selected</option><option>Apple Music</option><option>Spotify</option><option>YouTube Music</option><option>My device library</option></select></label><p>Connections depend on services available on your device. PACE does not download or redistribute songs.</p></section><MusicGroup icon={<Music2/>} title="Songs near my chosen rhythm" songs={matching}/><section className="therapist-setting">
      <h2>Rhythm set with a therapist</h2>
      <p>A clinician or qualified therapist can set a personal practice rhythm. No single BPM is right for everyone.</p>
      <div><Input inputMode="numeric" value={targetText} onChange={(event) => setTargetText(event.target.value)} placeholder="Steps per minute" aria-label="Therapist target rhythm"/><Button variant="outline" size="xl" onClick={() => { const value = Number(targetText); state.setTargetCadence(Number.isFinite(value) && value > 0 ? value : null); }}>Save rhythm</Button></div>
    </section></details><p className="observation-note">Music is optional support for practice and enjoyment. It does not cure or treat Parkinson's.</p>
  </div>;
}

function matchLabel(bpm: number | null, target: number | null) {
  if (!bpm || !target) return "Tempo not available";
  const difference = Math.abs(bpm - target);
  return difference <= 3 ? "Great rhythm match" : difference <= 8 ? "Close rhythm match" : "Different rhythm";
}

function SongRow({ song, target, favorite, toggle, choose }: { song: MusicFavorite; target: number | null; favorite: boolean; toggle: () => void; choose: () => void }) {
  return <article className="song-row"><div><h3>{song.title}</h3><p>{song.artist} · {song.genre}</p><b className="advanced-only">{matchLabel(song.bpm, target)}</b></div><div className="activity-actions"><Button size="lg" onClick={choose}>Choose</Button><Button size="iconLg" variant={favorite ? "amber" : "outline"} onClick={toggle} aria-label={`${favorite ? "Remove" : "Add"} ${song.title} ${favorite ? "from" : "to"} favorites`}><Heart className={favorite ? "fill-current" : ""}/></Button></div></article>;
}

function MusicGroup({ icon, title, songs }: { icon: ReactNode; title: string; songs: MusicFavorite[] }) {
  return <section className="music-group"><h2>{icon}{title}</h2>{songs.length ? songs.map((song) => <p key={song.id}><strong>{song.title}</strong><span>{song.artist}</span></p>) : <p className="empty-music">Nothing saved here yet.</p>}</section>;
}