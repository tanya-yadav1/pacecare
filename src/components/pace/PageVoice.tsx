import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Mic, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { understandPaceChoice } from "@/lib/pace-voice";

type BrowserRecognition = {
lang: string;
interimResults: boolean;
continuous: boolean;
start: () => void;
stop: () => void;
onresult:
| ((event: {
results: ArrayLike<{ 0: { transcript: string } }>;
}) => void)
| null;
onerror: (() => void) | null;
onend: (() => void) | null;
};

type RecognitionConstructor = new () => BrowserRecognition;

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
"Quiet. Take a calm minute to rest. Choose a peaceful sound or simply breathe.",

"/progress":
"My Journey. Look back at moments you enjoyed and add a short note if you like.",

"/accessibility":
"Accessibility settings. Here you can make text larger, turn on high contrast, and adjust voice settings.",

"/staff":
"Staff overview. This screen shows residents and thoughtful connection ideas.",

"/pace-demo":
"PACE demo. This is a short sample walk-through with pretend data.",
};

function introFor(path: string, name: string) {
const base =
pageIntros[path] ??
"I'm PACE. You can talk to me or choose something on the screen.";

if (path === "/") {
return base.replace("Good morning.", `Good morning, ${name}.`);
}

return base;
}

/*

* Simple browser speech.
*
* This does not use the generated speech API.
* The browser speaks immediately when the user presses a button.
  */
  function speakWithBrowser(text: string): boolean {
  if (
  typeof window === "undefined" ||
  !("speechSynthesis" in window)
  ) {
  return false;
  }

const SpeechSynthesisUtterance =
window.SpeechSynthesisUtterance;

if (!SpeechSynthesisUtterance) {
return false;
}

window.speechSynthesis.cancel();

const utterance = new SpeechSynthesisUtterance(text);

utterance.rate = 0.82;
utterance.pitch = 1;
utterance.volume = 1;

window.speechSynthesis.speak(utterance);

return true;
}

export function PageVoice() {
const path = useRouterState({
select: (state) => state.location.pathname,
});

const navigate = useNavigate();

const { name } = useLumaStrideWellness();

const recognition = useRef<BrowserRecognition | null>(null);

const [speaking, setSpeaking] = useState(false);
const [listening, setListening] = useState(false);
const [heard, setHeard] = useState("");
const [reply, setReply] = useState("");
const [supported, setSupported] = useState(false);
const [started, setStarted] = useState(false);

/*

* Set up browser speech recognition.
  */
  useEffect(() => {
  const scope = window as typeof window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
  };

```
const Recognition =
```

```
  scope.SpeechRecognition ??
  scope.webkitSpeechRecognition;

if (!Recognition) {
  setSupported(false);
  return;
}

setSupported(true);

const instance = new Recognition();

instance.lang = "en-US";
instance.interimResults = false;
instance.continuous = false;

instance.onresult = (event) => {
  const transcript =
    event.results[0]?.[0]?.transcript ?? "";

  handleWords(transcript);
};

instance.onerror = () => {
  setListening(false);

  setReply(
    "I couldn't hear that. Please try again, or choose something on the screen."
  );
};

instance.onend = () => {
  setListening(false);
};

recognition.current = instance;

return () => {
  instance.stop();
  recognition.current = null;
};
```

}, []);

/*

* Speak a message.
  */
  const speak = (text: string) => {
  const worked = speakWithBrowser(text);

```
if (!worked) {
```

```
  setSpeaking(false);
  return;
}

setSpeaking(true);

/*
 * Check periodically whether the browser has finished speaking.
 */
const checkSpeech = window.setInterval(() => {
  if (!window.speechSynthesis.speaking) {
    window.clearInterval(checkSpeech);
    setSpeaking(false);
  }
}, 200);

/*
 * Safety timeout in case a browser does not update correctly.
 */
window.setTimeout(() => {
  window.clearInterval(checkSpeech);
  setSpeaking(false);
}, 15000);
```

};

/*

* Start PACE.
*
* This function is called directly from the Start PACE button.
* That is important because browsers allow speech after a user gesture.
  */
  const startPace = () => {
  const message = introFor(path, name);

```
setStarted(true);
```

```
setReply("");
setHeard("");

speak(message);
```

};

/*

* Start microphone listening.
  */
  const startListening = () => {
  if (!supported) {
  const message =
  "Voice listening isn't available on this device. You can choose an option on the screen instead.";

  setReply(message);
  speak(message);

  return;
  }

```
if (listening || speaking) {
```

```
  return;
}

setListening(true);
setHeard("");
setReply("");

try {
  recognition.current?.start();
} catch {
  setListening(false);

  const message =
    "Let's try that again. Please tap Talk to PACE once more.";

  setReply(message);
  speak(message);
}
```

};

/*

* Hear the current page again.
  */
  const hearPage = () => {
  const message = introFor(path, name);

```
speak(message);
```

};

/*

* Interpret what the senior says.
  */
  const handleWords = (words: string) => {
  const clean = words.trim();

```
if (!clean) {
```

```
  setListening(false);
  return;
}

const lower = clean.toLowerCase();

setHeard(clean);
setListening(false);

/*
 * HOME
 */
if (
  lower.includes("home") ||
  lower.includes("start over") ||
  lower.includes("main page")
) {
  setReply("Going home.");
  speak("Going home.");

  window.setTimeout(() => {
    void navigate({ to: "/" });
  }, 900);

  return;
}

/*
 * BACK
 */
if (
  lower.includes("go back") ||
  lower.includes("previous") ||
  lower === "back"
) {
  setReply("Going back.");
  speak("Going back.");

  window.setTimeout(() => {
    window.history.back();
  }, 900);

  return;
}

/*
 * Use the existing PACE command system.
 */
const result = understandPaceChoice(clean);

setReply(result.reply);

speak(result.reply);

if (result.path) {
  window.setTimeout(() => {
    void navigate({ to: result.path });
  }, 1200);
}
```

};

/*

* FIRST SCREEN
*
* PACE waits for the user to press Start PACE.
* The button directly triggers browser speech.
  */
  if (!started) {
  return (

   <div
     className="page-voice"
     role="region"
     aria-label="Welcome to PACE"
   >
     <div className="page-voice-inner">
       <div className="page-voice-welcome">
         <Volume2
           aria-hidden
           className="page-voice-welcome-icon"
         />

  ```
     <p
       className="page-voice-reply"
       aria-live="polite"
     >
       Welcome to PACE.
     </p>

     <p className="page-voice-hint">
       I'm here to help you enjoy your day, stay connected,
       and feel supported.
     </p>

     <Button
       variant="default"
       size="xl"
       className="pace-start-button"
       onClick={startPace}
       aria-label="Start PACE and hear welcome"
     >
       <Volume2 aria-hidden />
       Start PACE
     </Button>
   </div>
  ```

     </div>
   </div>

```
);
```

}

/*

* NORMAL PACE SCREEN
  */
  return ( <div
  className="page-voice"
  role="region"
  aria-label="PACE voice assistant"
   >

   <div className="page-voice-inner">
     {reply ? (
       <p
         className="page-voice-reply"
         aria-live="polite"
       >
         {reply}

  ```
     {heard && (
       <span className="sr-only">
         {" "}
         You said: {heard}.
       </span>
     )}
   </p>
  ```

  ) : ( <p
      className="page-voice-hint"
      aria-live="polite"
    >
  {speaking
  ? "PACE is speaking..."
  : listening
  ? "I'm listening... Take your time."
  : `Good morning, ${name}.`} </p>
  )}

     <div className="page-voice-actions">
       <Button
         variant={listening ? "default" : "amber"}
         size="xl"
         onClick={startListening}
         disabled={listening || speaking}
         aria-label="Talk to PACE"
       >
         <Mic aria-hidden />

  ```
     {listening
       ? "Listening..."
       : "Talk to PACE"}
   </Button>

   <Button
     variant="secondary"
     size="xl"
     onClick={hearPage}
     disabled={speaking}
     aria-label="Hear PACE"
   >
     <Volume2 aria-hidden />

     {speaking
       ? "Speaking..."
       : "Hear PACE"}
   </Button>
  ```

     </div>
   </div>

```
</div>
```

);
}
