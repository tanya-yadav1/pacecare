import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type MusicFavorite = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number | null;
  enjoyment: number;
};

type WellnessState = {
  name: string;
  cadence: number | null;
  targetCadence: number | null;
  favoriteSongs: MusicFavorite[];
  favoriteArtists: string[];
  favoriteGenres: string[];
  musicService: string;
  setCadence: (cadence: number) => void;
  setTargetCadence: (cadence: number | null) => void;
  toggleSong: (song: MusicFavorite) => void;
  toggleArtist: (artist: string) => void;
  toggleGenre: (genre: string) => void;
  setMusicService: (service: string) => void;
};

const WellnessContext = createContext<WellnessState | null>(null);
const STORAGE_KEY = "lumastride-wellness";

export function LumaStrideWellnessProvider({ children }: { children: ReactNode }) {
  const [cadence, setCadenceState] = useState<number | null>(null);
  const [targetCadence, setTargetCadenceState] = useState<number | null>(null);
  const [favoriteSongs, setFavoriteSongs] = useState<MusicFavorite[]>([]);
  const [favoriteArtists, setFavoriteArtists] = useState<string[]>([]);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [musicService, setMusicServiceState] = useState("None selected");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<WellnessState> | null;
      if (!saved) return;
      setCadenceState(typeof saved.cadence === "number" ? saved.cadence : null);
      setTargetCadenceState(typeof saved.targetCadence === "number" ? saved.targetCadence : null);
      setFavoriteSongs(Array.isArray(saved.favoriteSongs) ? saved.favoriteSongs : []);
      setFavoriteArtists(Array.isArray(saved.favoriteArtists) ? saved.favoriteArtists : []);
      setFavoriteGenres(Array.isArray(saved.favoriteGenres) ? saved.favoriteGenres : []);
      setMusicServiceState(typeof saved.musicService === "string" ? saved.musicService : "None selected");
    } catch { /* use friendly defaults */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cadence, targetCadence, favoriteSongs, favoriteArtists, favoriteGenres, musicService }));
  }, [cadence, targetCadence, favoriteSongs, favoriteArtists, favoriteGenres, musicService]);

  const value = useMemo<WellnessState>(() => ({
    name: "Tanya",
    cadence,
    targetCadence,
    favoriteSongs,
    favoriteArtists,
    favoriteGenres,
    musicService,
    setCadence: (value) => setCadenceState(Math.max(30, Math.min(180, Math.round(value)))),
    setTargetCadence: (value) => setTargetCadenceState(value === null ? null : Math.max(30, Math.min(180, Math.round(value)))),
    toggleSong: (song) => setFavoriteSongs((current) => current.some((item) => item.id === song.id) ? current.filter((item) => item.id !== song.id) : [...current, song]),
    toggleArtist: (artist) => setFavoriteArtists((current) => current.includes(artist) ? current.filter((item) => item !== artist) : [...current, artist]),
    toggleGenre: (genre) => setFavoriteGenres((current) => current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre]),
    setMusicService: setMusicServiceState,
  }), [cadence, targetCadence, favoriteSongs, favoriteArtists, favoriteGenres, musicService]);

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
}

export function useLumaStrideWellness() {
  const value = useContext(WellnessContext);
  if (!value) throw new Error("LumaStrideWellnessProvider missing");
  return value;
}