import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { usePaceAuth, type PacePerson } from "@/lib/pace-auth";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Let's get to know you — PACE" },
      {
        name: "description",
        content: "A few gentle questions so PACE knows your name, your music, and the people you love.",
      },
      { property: "og:title", content: "Let's get to know you — PACE" },
      { property: "og:description", content: "One easy question at a time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const musicOptions = ["Jazz", "Big band", "Gospel", "Country", "Classical", "Oldies", "Piano"];
const interestOptions = [
  "Gardening",
  "Stories",
  "Cooking",
  "Birds",
  "Card games",
  "Painting",
  "Walking",
  "Faith",
];

export function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function Onboarding() {
  const navigate = useNavigate();
  const { preferences, savePreferences, saveGreetingName } = usePaceAuth();
  const { accessibility, setAccessibility } = useLumaStrideWellness();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [music, setMusic] = useState<string[]>(preferences.music);
  const [people, setPeople] = useState<PacePerson[]>(preferences.people);
  const [personName, setPersonName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [interests, setInterests] = useState<string[]>(preferences.interests);
  const [busy, setBusy] = useState(false);

  const finish = async () => {
    setBusy(true);
    await saveGreetingName(name);
    await savePreferences({ music, people, interests, onboarded: true });
    setBusy(false);
    void navigate({ to: "/", replace: true });
  };

  const steps = [
    {
      question: "What would you like PACE to call you?",
      body: (
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Eleanor"
          aria-label="Preferred name"
        />
      ),
      canContinue: name.trim().length > 0,
    },
    {
      question: "What music do you enjoy?",
      body: (
        <div className="chip-grid">
          {musicOptions.map((option) => (
            <Button
              key={option}
              size="xl"
              variant={music.includes(option) ? "default" : "outline"}
              onClick={() => setMusic(toggle(music, option))}
            >
              {option}
            </Button>
          ))}
        </div>
      ),
      canContinue: true,
    },
    {
      question: "Who do you like to talk with?",
      body: (
        <div className="stack-gap">
          <div className="entry-row">
            <Input
              value={personName}
              onChange={(event) => setPersonName(event.target.value)}
              placeholder="Maya"
              aria-label="Their name"
            />
            <Input
              value={relationship}
              onChange={(event) => setRelationship(event.target.value)}
              placeholder="Daughter"
              aria-label="Their relationship to you"
            />
            <Button
              size="xl"
              disabled={!personName.trim()}
              onClick={() => {
                setPeople([
                  ...people,
                  { name: personName.trim(), relationship: relationship.trim() || "Friend" },
                ]);
                setPersonName("");
                setRelationship("");
              }}
            >
              Add
            </Button>
          </div>
          {people.map((person) => (
            <p className="saved-line" key={`${person.name}-${person.relationship}`}>
              {person.name} · {person.relationship}
            </p>
          ))}
        </div>
      ),
      canContinue: true,
    },
    {
      question: "What do you enjoy doing?",
      body: (
        <div className="chip-grid">
          {interestOptions.map((option) => (
            <Button
              key={option}
              size="xl"
              variant={interests.includes(option) ? "default" : "outline"}
              onClick={() => setInterests(toggle(interests, option))}
            >
              {option}
            </Button>
          ))}
        </div>
      ),
      canContinue: true,
    },
    {
      question: "How big would you like the words?",
      body: (
        <div className="chip-grid">
          {(["standard", "large", "extra-large"] as const).map((size) => (
            <Button
              key={size}
              size="xl"
              variant={accessibility.textSize === size ? "default" : "outline"}
              onClick={() => setAccessibility({ ...accessibility, textSize: size })}
            >
              {size === "extra-large" ? "Extra Large" : size === "large" ? "Large" : "Standard"}
            </Button>
          ))}
        </div>
      ),
      canContinue: true,
    },
    {
      question: "Would you like PACE to read the screen out loud?",
      body: (
        <div className="chip-grid">
          <Button
            size="xl"
            variant={accessibility.voiceInstructions ? "default" : "outline"}
            onClick={() => setAccessibility({ ...accessibility, voiceInstructions: true })}
          >
            Yes, please
          </Button>
          <Button
            size="xl"
            variant={!accessibility.voiceInstructions ? "default" : "outline"}
            onClick={() => setAccessibility({ ...accessibility, voiceInstructions: false })}
          >
            No, thank you
          </Button>
        </div>
      ),
      canContinue: true,
    },
  ];

  const current = steps[step]!;
  const isLast = step === steps.length - 1;

  return (
    <div className="simple-page">
      {step > 0 && (
        <button className="simple-back" onClick={() => setStep(step - 1)}>
          <ChevronLeft />
          Back
        </button>
      )}
      <p className="eyebrow">
        Question {step + 1} of {steps.length}
      </p>
      <h1>{current.question}</h1>
      <div className="stack-gap">{current.body}</div>
      <Button
        size="xl"
        disabled={!current.canContinue || busy}
        onClick={() => (isLast ? void finish() : setStep(step + 1))}
      >
        {isLast ? "All done" : "Next"}
      </Button>
      <p className="simple-note">You can change any of this later in My Settings.</p>
    </div>
  );
}
