import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Mic, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { understandPaceChoice } from "@/lib/pace-voice";

type SpeechRecognitionEventLike = {
results: {
[index: number]: {
[index: number]: {
transcript: string;
};
};
};
};

type SpeechRecognitionLike = {
lang: string;
interimResults: boolean;
continuous: boolean;
start: () => void;
stop: () => void;
onresult: ((event: SpeechRecognitionEventLike) => void) | null;
onerror: (() => void) | null;
onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechWindow = Window & {
SpeechRecognition?: SpeechRecognitionConstructor;
webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const pageIntros: Record<string, string> = {
"/":
"Good morning. I'm PACE. I'm here to help you enjoy your day and stay connected. What would you like to do today? You can say listen, connect, explore, or quiet.",

"/music":
"Listen. Here you can enjoy music you like. You can choose a song and play it.",

"/community":
"Connect. Here you can reach family, friends, or neighbors. Choose someone you would like to connect with.",

"/mind-body":
"Explore. Here you can discover gentle movement, stretching, or breathing activities.",

"/relax":
"Quiet. Take a calm minute to rest. Choose a peaceful sound or simply bre
