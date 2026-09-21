import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Eye, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { usePaceAuth } from "@/lib/pace-auth";

export const Route = createFileRoute("/accessibility")({
  head: () => ({ meta: [
    { title: "Accessibility Settings — PACE" },
    { name: "description", content: "Personalize text, contrast, voice instructions, motion, and screen reader support in PACE." },
    { property: "og:title", content: "Accessibility Settings — PACE" },
    { property: "og:description", content: "Make PACE comfortable and easier to use." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: AccessibilitySettings,
});

function AccessibilitySettings() {
  const { accessibility, setAccessibility } = useLumaStrideWellness();
  const { signOut } = usePaceAuth();
  const update = (changes: Partial<typeof accessibility>) => setAccessibility({ ...accessibility, ...changes });
  return <div className="simple-page"><Link to="/" className="simple-back"><ChevronLeft/>Home</Link><p className="eyebrow">Senior Mode</p><h1>Accessibility Settings</h1><p className="simple-lead">Choose what makes PACE easiest for you to see, hear, and use.</p><section className="settings-section"><h2>Text size</h2><div className="duration-row">{(["standard", "large", "extra-large"] as const).map((size) => <Button key={size} size="xl" variant={accessibility.textSize === size ? "default" : "outline"} onClick={() => update({ textSize: size })}>{size === "extra-large" ? "Extra Large" : size[0]?.toUpperCase() + size.slice(1)}</Button>)}</div></section><section className="settings-section"><h2>Comfort options</h2><SettingButton icon={Eye} label="High Contrast" active={accessibility.highContrast} onClick={() => update({ highContrast: !accessibility.highContrast })}/><SettingButton icon={Volume2} label="Voice Instructions" active={accessibility.voiceInstructions} onClick={() => update({ voiceInstructions: !accessibility.voiceInstructions })}/><SettingButton label="Reduced Motion" active={accessibility.reducedMotion} onClick={() => update({ reducedMotion: !accessibility.reducedMotion })}/><SettingButton label="Screen Reader Support" active={accessibility.screenReaderSupport} onClick={() => update({ screenReaderSupport: !accessibility.screenReaderSupport })}/></section><section className="settings-section"><h2>Your account</h2><Button size="xl" variant="outline" onClick={() => void signOut()}>Sign out</Button></section><p className="simple-note">Your choices are saved to your PACE account.</p></div>;
}

function SettingButton({ icon: Icon, label, active, onClick }: { icon?: typeof Eye; label: string; active: boolean; onClick: () => void }) {
  return <Button className="setting-toggle" size="xl" variant={active ? "default" : "outline"} onClick={onClick} aria-pressed={active}>{Icon && <Icon/>}<span>{label}</span><strong>{active ? "On" : "Off"}</strong></Button>;
}