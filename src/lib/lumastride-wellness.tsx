import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type MusicFavorite = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number | null;
  enjoyment: number;
};

export type WellnessSession = {
  id: string;
  date: string;
  category: string;
  title: string;
  minutes: number;
  feeling: "Easy" | "About right" | "Difficult";
};

export type WellnessObservation = {
  id: string;
  date: string;
  category: string;
  note: string;
  value?: string;
};

type WellnessState = {
  name: string;
  cadence: number | null;
  targetCadence: number | null;
  favoriteSongs: MusicFavorite[];
  favoriteArtists: string[];
  favoriteGenres: string[];
  musicService: string;
  goals: string[];
  preferredActivities: string[];
  availableMinutes: number;
  sessions: WellnessSession[];
  observations: WellnessObservation[];
  doctorQuestions: string[];
  medications: string[];
  setCadence: (cadence: number) => void;
  setTargetCadence: (cadence: number | null) => void;
  toggleSong: (song: MusicFavorite) => void;
  toggleArtist: (artist: string) => void;
  toggleGenre: (genre: string) => void;
  setMusicService: (service: string) => void;
  setGoals: (goals: string[]) => void;
  setPreferredActivities: (activities: string[]) => void;
  setAvailableMinutes: (minutes: number) => void;
  addSession: (session: Omit<WellnessSession, "id" | "date">) => void;
  addObservation: (observation: Omit<WellnessObservation, "id" | "date">) => void;
  setDoctorQuestions: (questions: string[]) => void;
  setMedications: (medications: string[]) => void;
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
  const [goals, setGoalsState] = useState<string[]>([]);
  const [preferredActivities, setPreferredActivitiesState] = useState<string[]>([]);
  const [availableMinutes, setAvailableMinutesState] = useState(10);
  const [sessions, setSessions] = useState<WellnessSession[]>([]);
  const [observations, setObservations] = useState<WellnessObservation[]>([]);
  const [doctorQuestions, setDoctorQuestionsState] = useState<string[]>([]);
  const [medications, setMedicationsState] = useState<string[]>([]);

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
      setGoalsState(Array.isArray(saved.goals) ? saved.goals : []);
      setPreferredActivitiesState(Array.isArray(saved.preferredActivities) ? saved.preferredActivities : []);
      setAvailableMinutesState(typeof saved.availableMinutes === "number" ? saved.availableMinutes : 10);
      setSessions(Array.isArray(saved.sessions) ? saved.sessions : []);
      setObservations(Array.isArray(saved.observations) ? saved.observations : []);
      setDoctorQuestionsState(Array.isArray(saved.doctorQuestions) ? saved.doctorQuestions : []);
      setMedicationsState(Array.isArray(saved.medications) ? saved.medications : []);
    } catch { /* use friendly defaults */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, cadence, targetCadence, favoriteSongs, favoriteArtists, favoriteGenres, musicService, goals, preferredActivities, availableMinutes, sessions, observations, doctorQuestions, medications }));
  }, [cadence, targetCadence, favoriteSongs, favoriteArtists, favoriteGenres, musicService, goals, preferredActivities, availableMinutes, sessions, observations, doctorQuestions, medications]);

  const value = useMemo<WellnessState>(() => ({
    name: "Tanya",
    cadence,
    targetCadence,
    favoriteSongs,
    favoriteArtists,
    favoriteGenres,
    musicService,
    goals,
    preferredActivities,
    availableMinutes,
    sessions,
    observations,
    doctorQuestions,
    medications,
    setCadence: (value) => setCadenceState(Math.max(30, Math.min(180, Math.round(value)))),
    setTargetCadence: (value) => setTargetCadenceState(value === null ? null : Math.max(30, Math.min(180, Math.round(value)))),
    toggleSong: (song) => setFavoriteSongs((current) => current.some((item) => item.id === song.id) ? current.filter((item) => item.id !== song.id) : [...current, song]),
    toggleArtist: (artist) => setFavoriteArtists((current) => current.includes(artist) ? current.filter((item) => item !== artist) : [...current, artist]),
    toggleGenre: (genre) => setFavoriteGenres((current) => current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre]),
    setMusicService: setMusicServiceState,
    setGoals: setGoalsState,
    setPreferredActivities: setPreferredActivitiesState,
    setAvailableMinutes: (minutes) => setAvailableMinutesState([5, 10, 20, 30].includes(minutes) ? minutes : 10),
    addSession: (session) => setSessions((current) => [{ ...session, id: crypto.randomUUID(), date: new Date().toISOString() }, ...current].slice(0, 100)),
    addObservation: (observation) => setObservations((current) => [{ ...observation, id: crypto.randomUUID(), date: new Date().toISOString() }, ...current].slice(0, 100)),
    setDoctorQuestions: setDoctorQuestionsState,
    setMedications: setMedicationsState,
  }), [cadence, targetCadence, favoriteSongs, favoriteArtists, favoriteGenres, musicService, goals, preferredActivities, availableMinutes, sessions, observations, doctorQuestions, medications]);

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
}

export function useLumaStrideWellness() {
  const value = useContext(WellnessContext);
  if (!value) throw new Error("LumaStrideWellnessProvider missing");
  return value;
}