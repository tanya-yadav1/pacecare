import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Activity, ChevronLeft, Footprints, Hand, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";

export const Route = createFileRoute("/walk")({
  head: () => ({ meta: [
    { title: "Walk with Music — AsterStep" },
    { name: "description", content: "Find a comfortable walking rhythm and choose music for movement practice." },
    { property: "og:title", content: "Walk with Music — AsterStep" },
    { property: "og:description", content: "Personalized music and rhythm support for movement practice." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Walk,
});

type Stage = "choice" | "measure" | "result";

function Walk() {
  const navigate = useNavigate();
  const { cadence, setCadence } = useLumaStrideWellness();
  const [stage, setStage] = useState<Stage>(cadence ? "result" : "choice");
  const [seconds, setSeconds] = useState(30);
  const [steps, setSteps] = useState(0);
  const [measuring, setMeasuring] = useState(false);
  const [sensorLabel, setSensorLabel] = useState("Tap once for every step");
  const lastMotion = useRef(0);

  useEffect(() => {
    if (!measuring) return;
    const timer = window.setInterval(() => setSeconds((value) => {
      if (value <= 1) {
        window.clearInterval(timer);
        setMeasuring(false);
        const result = Math.max(30, steps * 2);
        setCadence(result);
        setStage("result");
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [measuring, setCadence, steps]);

  useEffect(() => {
    if (!measuring || typeof DeviceMotionEvent === "undefined") return;
    const onMotion = (event: DeviceMotionEvent) => {
      const value = event.accelerationIncludingGravity;
      const force = Math.sqrt((value?.x ?? 0) ** 2 + (value?.y ?? 0) ** 2 + (value?.z ?? 0) ** 2);
      const now = Date.now();
      if (force > 12.5 && now - lastMotion.current > 350) {
        lastMotion.current = now;
        setSteps((count) => count + 1);
        setSensorLabel("Phone motion is counting your steps");
      }
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [measuring]);

  const start = async () => {
    setSteps(0); setSeconds(30); setSensorLabel("Tap once for every step"); setMeasuring(true);
    const motion = DeviceMotionEvent as typeof DeviceMotionEvent & { requestPermission?: () => Promise<PermissionState> };
    if (typeof motion.requestPermission === "function") {
      try {
        const permission = await motion.requestPermission();
        if (permission !== "granted") setSensorLabel("Motion is unavailable — tap once for every step");
      } catch { setSensorLabel("Motion is unavailable — tap once for every step"); }
    }
  };

  return <div className="simple-page">
    <Link to="/" className="simple-back"><ChevronLeft /> Home</Link>
    {stage === "choice" && <section className="simple-center">
      <Footprints className="simple-page-icon" aria-hidden />
      <h1>Let’s find your rhythm.</h1>
      <p className="simple-lead">Choose the easiest way to begin.</p>
      <div className="simple-stack">
        <Button size="xl" variant="amber" onClick={() => { setCadence(82); setStage("result"); }}>Use My Usual Rhythm</Button>
        <Button size="xl" variant="outline" onClick={() => setStage("measure")}>Help Me Find My Rhythm</Button>
      </div>
    </section>}
    {stage === "measure" && <section className="simple-center">
      <Smartphone className="simple-page-icon" aria-hidden />
      <h1>Walk normally for 30 seconds.</h1>
      <p className="simple-lead">Keep your phone with you. If it does not count a step, tap the large area below.</p>
      {!measuring ? <Button size="xl" variant="amber" onClick={start}>Start 30 Seconds</Button> : <button className="step-tap" onClick={() => setSteps((count) => count + 1)} aria-label="Count one step">
        <span className="step-time">{seconds}</span><span>seconds left</span><strong><Hand /> TAP FOR EACH STEP</strong><small>{sensorLabel}</small><b>{steps} steps</b>
      </button>}
    </section>}
    {stage === "result" && cadence && <section className="simple-center">
      <Activity className="simple-page-icon" aria-hidden />
      <h1>Your walking rhythm is about<br/><strong className="cadence-result">{cadence} steps/minute.</strong></h1>
      <p className="simple-lead">We’ll use this rhythm to help choose music for your walking practice.</p>
      <p className="simple-note">This is a personal practice guide, not a medical recommendation.</p>
      <div className="simple-stack">
        <Button size="xl" variant="amber" onClick={() => navigate({ to: "/music" })}>Choose My Music</Button>
        <Button size="xl" variant="outline" onClick={() => setStage("measure")}>Measure Again</Button>
      </div>
    </section>}
  </div>;
}