import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Footprints, Heart, Music2 } from "lucide-react";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";

export const Route = createFileRoute("/progress")({ head: () => ({ meta: [
  { title: "My Progress — AsterStep" }, { name: "description", content: "A simple view of your saved walking rhythm and music." },
  { property: "og:title", content: "My Progress — AsterStep" }, { property: "og:description", content: "A simple view of your saved walking rhythm and music." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Progress });

function Progress() { const { cadence, targetCadence, favoriteSongs } = useLumaStrideWellness(); return <div className="simple-page"><Link to="/" className="simple-back"><ChevronLeft/> Home</Link><section className="simple-center"><h1>My Progress</h1><p className="simple-lead">The things you’ve chosen to keep.</p><div className="progress-list"><article><Footprints/><span>My walking rhythm</span><strong>{cadence ? `${cadence} steps/minute` : "Not measured yet"}</strong></article><article><Music2/><span>My practice rhythm</span><strong>{targetCadence ? `${targetCadence} steps/minute` : "Using my walking rhythm"}</strong></article><article><Heart/><span>Favorite songs</span><strong>{favoriteSongs.length}</strong></article></div></section></div>; }