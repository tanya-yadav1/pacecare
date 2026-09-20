import { createFileRoute, Link } from "@tanstack/react-router";
import { Armchair, Footprints, Minus, Music2, Pause, Play, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTestScores } from "@/lib/vitamove-tests";

export const Route = createFileRoute("/remedies")({
  head: () => ({
    meta: [
      { title: "Adaptive Physical Remedies — PACE" },
      { name: "description", content: "Routines that adapt to your motor and cognitive screening results, with a visual metronome." },
      { property: "og:title", content: "Adaptive Physical Remedies — PACE" },
      { property: "og:description", content: "Routines that adapt to your motor and cognitive screening results, with a visual metronome." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Remedies,
});

type Routine = { title: string; icon: typeof Armchair; focus: string; steps: string[] };

function buildRoutines(tap: number | null, tremor: number | null, cognitive: number | null) {
  const slow = tap !== null && tap < 40;
  const shaky = tremor !== null && tremor > 3;
  const foggy = cognitive !== null && cognitive < 70;

  const yoga: Routine = {
    title: "Seated yoga flow",
    icon: Armchair,
    focus: shaky ? "Tremor damping · weighted, slow holds" : "Mobility · open posture",
    steps: shaky
      ? ["Seated mountain breath, palms pressed together — 6 breaths", "Weighted forward fold with forearms on thighs — 45 seconds", "Slow seated twist, holding the chair edge — 5 each side", "Open-palm press against the thigh to steady the hand — 8 holds"]
      : ["Seated mountain breath with arms overhead — 6 breaths", "Seated cat-cow through the spine — 10 cycles", "Chair-supported side bend — 6 each side", "Ankle and wrist circles — 20 each"],
  };

  const gait: Routine = {
    title: "High-amplitude gait training",
    icon: Footprints,
    focus: slow ? "Bradykinesia · exaggerated amplitude" : "Stride length · confident pacing",
    steps: slow
      ? ["March in place with knees deliberately high — 20 steps", "BIG heel strikes down a hallway, counting out loud — 2 lengths", "Exaggerated arm swing walking — 2 minutes", "Wide turning arcs instead of pivots — 6 turns"]
      : ["Long-stride walking with a visual floor target — 2 minutes", "Heel-to-toe line walking — 20 steps", "Arm-swing walking with shoulder rolls — 2 minutes", "Controlled stop-and-start drills — 8 reps"],
  };

  const rhythm: Routine = {
    title: "Rhythmic cueing block",
    icon: Music2,
    focus: foggy ? "Dual-task cueing · slower tempo" : "Freezing prevention · steady tempo",
    steps: foggy
      ? ["Step to the metronome while naming a colour each beat", "Alternate side steps on every second beat", "Pause and restart on cue — 6 rounds", "Finish with 10 slow breaths in time with the ticker"]
      : ["Step in place on every beat — 60 seconds", "Forward and back steps on the beat — 60 seconds", "Side-to-side weight shifts on the beat — 60 seconds", "Walk a straight line matching each heel strike to a beat"],
  };

  return { routines: [yoga, gait, rhythm], bpm: slow ? 80 : shaky ? 90 : 100 };
}

function Remedies() {
  const { scores } = useTestScores();
  const { routines, bpm: suggested } = buildRoutines(scores.motorTap, scores.tremorAmplitude, scores.cognitive);
  const [bpm, setBpm] = useState(suggested);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!synced) { setBpm(suggested); }
  }, [suggested, synced]);

  return (
    <div className="page">
      <span className="page-tag page-tag-treatment">Treatment</span>
      <p className="eyebrow">Adaptive Physical Remedies</p>
      <h1>A routine built from your own results.</h1>
      <p className="lead">
        {scores.motorTap === null && scores.tremorAmplitude === null && scores.cognitive === null
          ? "Complete the screening tests and this plan re-writes itself around your results."
          : "This plan is adapted from your latest motor, tremor and cognitive measurements."}
      </p>
      <div className="mt-5">
        <Button variant="outline" size="xl" asChild><Link to="/screening">Update my screening results</Link></Button>
      </div>

      <div className="mt-9 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <div className="space-y-5">
          {routines.map((r) => (
            <section key={r.title} className="feature-card">
              <div className="flex items-center gap-4">
                <r.icon className="h-10 w-10 shrink-0 text-primary" />
                <div>
                  <h2>{r.title}</h2>
                  <small className="font-bold uppercase tracking-wide text-muted-foreground">{r.focus}</small>
                </div>
              </div>
              <ol className="mt-4 space-y-3">
                {r.steps.map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary font-extrabold text-primary-foreground">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
        <Metronome bpm={bpm} setBpm={(v) => { setSynced(true); setBpm(v); }} suggested={suggested} />
      </div>
    </div>
  );
}

function Metronome({ bpm, setBpm, suggested }: { bpm: number; setBpm: (v: number) => void; suggested: number }) {
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(0);
  const beatRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => { beatRef.current = (beatRef.current + 1) % 4; setBeat(beatRef.current); }, 60000 / bpm);
    return () => clearInterval(id);
  }, [running, bpm]);

  return (
    <aside className="feature-card h-fit xl:sticky xl:top-40">
      <h2>Visual metronome</h2>
      <p className="mt-2 text-muted-foreground">An external rhythm cue helps override internal motion freezing.</p>
      <div className="my-6 grid place-items-center rounded-lg bg-primary p-7">
        <div
          className={`grid h-40 w-40 place-items-center rounded-full text-5xl font-black transition-all duration-100 ${running && beat === 0 ? "scale-110 bg-accent text-accent-foreground" : running ? "bg-primary-foreground/15 text-primary-foreground" : "bg-primary-foreground/10 text-primary-foreground"}`}
          aria-hidden
        >
          {beat + 1}
        </div>
        <div className="mt-5 flex gap-3" role="status" aria-label={`Metronome at ${bpm} beats per minute`}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-4 w-4 rounded-full ${running && beat === i ? "bg-accent" : "bg-primary-foreground/30"}`} />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="iconLg" aria-label="Slower tempo" onClick={() => setBpm(Math.max(40, bpm - 5))}><Minus /></Button>
        <div className="text-center"><strong className="block text-4xl">{bpm}</strong><small>BPM · suggested {suggested}</small></div>
        <Button variant="outline" size="iconLg" aria-label="Faster tempo" onClick={() => setBpm(Math.min(160, bpm + 5))}><Plus /></Button>
      </div>
      <Button size="xl" variant="amber" className="mt-5 w-full" onClick={() => setRunning(!running)}>
        {running ? <><Pause /> Pause Rhythm</> : <><Play /> Start Rhythm</>}
      </Button>
    </aside>
  );
}
