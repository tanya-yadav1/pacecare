import { supabase } from "@/integrations/supabase/client";

export type MusicItem = {
  id: string;
  title: string;
  artist: string | null;
  year: number | null;
  decade: string | null;
  genre: string | null;
  source_type: "reference" | "demo_audio" | "public_domain_lyrics";
  audio_url: string | null;
  lyrics: string | null;
};

export type MusicProfile = {
  birth_year: number | null;
  music_decade: string | null;
  favorite_genres: string[];
};

export const DECADE_CHOICES = ["1940s", "1950s", "1960s", "1970s"];

/** Works out which decade the senior was around twenty years old. */
export function decadeFromBirthYear(birthYear: number | null) {
  if (!birthYear) return null;
  return `${Math.floor((birthYear + 20) / 10) * 10}s`;
}

export async function loadMusicItems() {
  const { data } = await supabase
    .from("music_items")
    .select("id,title,artist,year,decade,genre,source_type,audio_url,lyrics")
    .order("year", { ascending: true });
  return (data ?? []) as MusicItem[];
}

export async function loadMusicProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("birth_year,music_decade,favorite_genres")
    .eq("id", userId)
    .maybeSingle();
  return {
    birth_year: data?.birth_year ?? null,
    music_decade: data?.music_decade ?? null,
    favorite_genres: data?.favorite_genres ?? [],
  } as MusicProfile;
}

export async function saveMusicDecade(userId: string, decade: string) {
  await supabase.from("profiles").update({ music_decade: decade }).eq("id", userId);
}

export type PlayAction = "played" | "searched" | "asked_staff" | "surprise";

export async function logMusicPlay(userId: string, itemId: string | null, action: PlayAction) {
  await supabase.from("music_plays").insert({ user_id: userId, music_item_id: itemId, action });
}

/** The songs this senior heard or looked for most recently. */
export async function recentPlayIds(userId: string, limit = 10) {
  const { data } = await supabase
    .from("music_plays")
    .select("music_item_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => row.music_item_id).filter(Boolean) as string[];
}

export function searchUrl(item: MusicItem) {
  const terms = [item.title, item.artist].filter(Boolean).join(" ");
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(terms)}`;
}

/* ---------- a soft demo tone, so every Play button does something ---------- */

let context: AudioContext | null = null;
let voices: OscillatorNode[] = [];
let master: GainNode | null = null;

function ensureContext() {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!context) context = new Ctor();
  void context.resume();
  return context;
}

export function playDemoTone(volume = 0.12) {
  const ctx = ensureContext();
  if (!ctx) return false;
  stopDemoTone();
  master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);
  voices = [261.63, 329.63, 392.0].map((frequency, index) => {
    const oscillator = ctx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    const gain = ctx.createGain();
    gain.gain.value = 0.34 - index * 0.06;
    oscillator.connect(gain).connect(master!);
    oscillator.start();
    return oscillator;
  });
  return true;
}

export function setDemoVolume(volume: number) {
  if (master) master.gain.value = volume;
}

export function stopDemoTone() {
  for (const oscillator of voices) {
    try {
      oscillator.stop();
    } catch {
      // already stopped
    }
  }
  voices = [];
  master = null;
}
