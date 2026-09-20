import { createFileRoute } from "@tanstack/react-router";
import { Armchair, Footprints, Minus, Music2, Pause, Play, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTestScores } from "@/lib/vitamove-tests";

export const Route = createFileRoute("/remedies")({
  head: () => ({
    meta: [
      { title: "Adaptive Physical Remedies — VitaMove" },
      { name: "description", content: "Routines that adapt to your motor and cognitive screening results, with a visual metronome." },
      { property: "og:title", content: "Adaptive Physical Remedies — VitaMove" },
      { property: "og:description", content: "Routines that adapt to your motor and cognitive screening results, with a visual metronome." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Remedies;
});

function Remedies() {
  return null;
}
