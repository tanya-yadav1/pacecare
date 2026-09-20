import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Info } from "lucide-react";
import { treatmentTopics } from "@/lib/wellness-content";

export const Route = createFileRoute("/treatment-info")({ head: () => ({ meta: [
  { title: "Treatment Information — Kindora" }, { name: "description", content: "High-level information about treatment and wellness options to discuss with qualified healthcare professionals." },
  { property: "og:title", content: "Treatment Information — Kindora" }, { property: "og:description", content: "Understand common care categories without personal medical advice." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: TreatmentInfo });

function TreatmentInfo() { return <div className="simple-page wide"><Link to="/" className="simple-back"><ChevronLeft/>Home</Link><p className="eyebrow">Treatment Information</p><h1>Learn before your next conversation.</h1><p className="simple-lead">These short overviews are general information, not recommendations for your personal care.</p><div className="info-list">{treatmentTopics.map((topic) => <details key={topic.title}><summary><Info/>{topic.title}</summary><p>{topic.text}</p>{topic.title === "Medication" && <strong>Talk with your healthcare professional before changing medication.</strong>}</details>)}</div><p className="report-disclaimer">Do not start, stop, or change medication based on information in this app.</p></div>; }