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

export type PersonalNote = { id: string; date: string; text: string };
export type PaceMode = "senior" | "staff";
export type ConnectionMoment = {
  id: string;
  date: string;
  choice: "Listen" | "Connect" | "Explore" | "Quiet";
  title: string;
  feedback?: "Loved it" | "It was okay" | "Not for me";
};
export type AccessibilityPreferences = {
  textSize: "standard" | "large" | "extra-large";
  highContrast: boolean;
  voiceInstructions: boolean;
  reducedMotion: boolean;
  screenReaderSupport: boolean;
};

type WellnessState = {
  name: string;
  mode: PaceMode;
  moments: ConnectionMoment[];
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
  personalNotes: PersonalNote[];
  careTeam: string[];
  circleSharing: string[];
  reportObservationIds: string[];
  accessibility: AccessibilityPreferences;
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
  addObservation: (observation: Omit<WellnessObservation, "id" | "date">) => string;
  setDoctorQuestions: (questions: string[]) => void;
  setMedications: (medications: string[]) => void;
  addPersonalNote: (text: string) => void;
  removePersonalNote: (id: string) => void;
  setCareTeam: (members: string[]) => void;
  setCircleSharing: (members: string[]) => void;
  setReportObservationIds: (ids: string[]) => void;
  setAccessibility: (preferences: AccessibilityPreferences) => void;
  setMode: (mode: PaceMode) => void;
  addMoment: (moment: Pick<ConnectionMoment, "choice" | "title">) => string;
  rateMoment: (id: string, feedback: NonNullable<ConnectionMoment["feedback"]>) => void;
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
  const [personalNotes, setPersonalNotes] = useState<PersonalNote[]>([]);
  const [careTeam, setCareTeamState] = useState<string[]>([]);
  const [circleSharing, setCircleSharingState] = useState<string[]>([]);
  const [reportObservationIds, setReportObservationIdsState] = useState<string[]>([]);
  const [accessibility, setAccessibilityState] = useState<AccessibilityPreferences>({
    textSize: "standard",
    highContrast: false,
    voiceInstructions: false,
    reducedMotion: false,
    screenReaderSupport: true,
  });
  const [mode, setModeState] = useState<PaceMode>("senior");
  const [moments, setMoments] = useState<ConnectionMoment[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? "null",
      ) as Partial<WellnessState> | null;
      if (!saved) return;
      setCadenceState(typeof saved.cadence === "number" ? saved.cadence : null);
      setTargetCadenceState(typeof saved.targetCadence === "number" ? saved.targetCadence : null);
      setFavoriteSongs(Array.isArray(saved.favoriteSongs) ? saved.favoriteSongs : []);
      setFavoriteArtists(Array.isArray(saved.favoriteArtists) ? saved.favoriteArtists : []);
      setFavoriteGenres(Array.isArray(saved.favoriteGenres) ? saved.favoriteGenres : []);
      setMusicServiceState(
        typeof saved.musicService === "string" ? saved.musicService : "None selected",
      );
      setGoalsState(Array.isArray(saved.goals) ? saved.goals : []);
      setPreferredActivitiesState(
        Array.isArray(saved.preferredActivities) ? saved.preferredActivities : [],
      );
      setAvailableMinutesState(
        typeof saved.availableMinutes === "number" ? saved.availableMinutes : 10,
      );
      setSessions(Array.isArray(saved.sessions) ? saved.sessions : []);
      setObservations(Array.isArray(saved.observations) ? saved.observations : []);
      setDoctorQuestionsState(Array.isArray(saved.doctorQuestions) ? saved.doctorQuestions : []);
      setMedicationsState(Array.isArray(saved.medications) ? saved.medications : []);
      setPersonalNotes(Array.isArray(saved.personalNotes) ? saved.personalNotes : []);
      setCareTeamState(Array.isArray(saved.careTeam) ? saved.careTeam : []);
      setCircleSharingState(Array.isArray(saved.circleSharing) ? saved.circleSharing : []);
      setReportObservationIdsState(
        Array.isArray(saved.reportObservationIds) ? saved.reportObservationIds : [],
      );
      if (saved.accessibility && typeof saved.accessibility === "object")
        setAccessibilityState({
          textSize: saved.accessibility["textSize"] ?? "standard",
          highContrast: Boolean(saved.accessibility["highContrast"]),
          voiceInstructions: Boolean(saved.accessibility["voiceInstructions"]),
          reducedMotion: Boolean(saved.accessibility["reducedMotion"]),
          screenReaderSupport: saved.accessibility["screenReaderSupport"] !== false,
        });
      setModeState(saved.mode === "staff" ? "staff" : "senior");
      setMoments(Array.isArray(saved.moments) ? saved.moments : []);
    } catch {
      /* use friendly defaults */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 4,
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
        personalNotes,
        careTeam,
        circleSharing,
        reportObservationIds,
        accessibility,
        mode,
        moments,
      }),
    );
  }, [
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
    personalNotes,
    careTeam,
    circleSharing,
    reportObservationIds,
    accessibility,
    mode,
    moments,
  ]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset["textSize"] = accessibility.textSize;
    root.classList.toggle("high-contrast", accessibility.highContrast);
    root.classList.toggle("reduce-motion", accessibility.reducedMotion);
  }, [accessibility]);

  const value = useMemo<WellnessState>(
    () => ({
      name: "Eleanor",
      mode,
      moments,
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
      personalNotes,
      careTeam,
      circleSharing,
      reportObservationIds,
      accessibility,
      setCadence: (value) => setCadenceState(Math.max(30, Math.min(180, Math.round(value)))),
      setTargetCadence: (value) =>
        setTargetCadenceState(
          value === null ? null : Math.max(30, Math.min(180, Math.round(value))),
        ),
      toggleSong: (song) =>
        setFavoriteSongs((current) =>
          current.some((item) => item.id === song.id)
            ? current.filter((item) => item.id !== song.id)
            : [...current, song],
        ),
      toggleArtist: (artist) =>
        setFavoriteArtists((current) =>
          current.includes(artist)
            ? current.filter((item) => item !== artist)
            : [...current, artist],
        ),
      toggleGenre: (genre) =>
        setFavoriteGenres((current) =>
          current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre],
        ),
      setMusicService: setMusicServiceState,
      setGoals: setGoalsState,
      setPreferredActivities: setPreferredActivitiesState,
      setAvailableMinutes: (minutes) =>
        setAvailableMinutesState([5, 10, 20, 30].includes(minutes) ? minutes : 10),
      addSession: (session) =>
        setSessions((current) =>
          [
            { ...session, id: crypto.randomUUID(), date: new Date().toISOString() },
            ...current,
          ].slice(0, 100),
        ),
      addObservation: (observation) => {
        const id = crypto.randomUUID();
        setObservations((current) =>
          [{ ...observation, id, date: new Date().toISOString() }, ...current].slice(0, 100),
        );
        return id;
      },
      setDoctorQuestions: setDoctorQuestionsState,
      setMedications: setMedicationsState,
      addPersonalNote: (text) =>
        setPersonalNotes((current) =>
          [{ id: crypto.randomUUID(), date: new Date().toISOString(), text }, ...current].slice(
            0,
            100,
          ),
        ),
      removePersonalNote: (id) =>
        setPersonalNotes((current) => current.filter((note) => note.id !== id)),
      setCareTeam: setCareTeamState,
      setCircleSharing: setCircleSharingState,
      setReportObservationIds: setReportObservationIdsState,
      setAccessibility: setAccessibilityState,
      setMode: setModeState,
      addMoment: (moment) => {
        const id = crypto.randomUUID();
        setMoments((current) =>
          [{ ...moment, id, date: new Date().toISOString() }, ...current].slice(0, 100),
        );
        return id;
      },
      rateMoment: (id, feedback) =>
        setMoments((current) =>
          current.map((moment) => (moment.id === id ? { ...moment, feedback } : moment)),
        ),
    }),
    [
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
      personalNotes,
      careTeam,
      circleSharing,
      reportObservationIds,
      accessibility,
      mode,
      moments,
    ],
  );

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
}

export function useLumaStrideWellness() {
  const value = useContext(WellnessContext);
  if (!value) throw new Error("LumaStrideWellnessProvider missing");
  return value;
}
