import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { deleteMyAccount } from "@/lib/pace-account.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { usePaceAuth, type PacePerson } from "@/lib/pace-auth";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "My Settings — PACE" },
      {
        name: "description",
        content: "Change your name, your music, the people you contact, your interests, text size, and spoken help.",
      },
      { property: "og:title", content: "My Settings — PACE" },
      { property: "og:description", content: "Everything about PACE, your way." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MySettings,
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

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function MySettings() {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { preferences, savePreferences, saveGreetingName, signOut } = usePaceAuth();
  const { name, accessibility, setAccessibility } = useLumaStrideWellness();
  const [draftName, setDraftName] = useState(name);
  const [personName, setPersonName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [saved, setSaved] = useState("");

  const people: PacePerson[] = preferences.people;

  const removeEverything = async () => {
    const result = await deleteMyAccount({});
    if (result.ok) {
      await signOut();
      window.location.href = "/auth";
    }
  };

  return (
    <div className="simple-page">
      <Link to="/" className="simple-back">
        <ChevronLeft />
        Home
      </Link>
      <p className="eyebrow">Senior Mode</p>
      <h1>My Settings</h1>
      <p className="simple-lead">Change anything here. PACE saves it to your account.</p>

      <section className="settings-section">
        <h2>My name</h2>
        <div className="entry-row">
          <Input value={draftName} onChange={(event) => setDraftName(event.target.value)} aria-label="Preferred name" />
          <Button
            size="xl"
            onClick={async () => {
              await saveGreetingName(draftName);
              setSaved("Name saved.");
            }}
          >
            Save
          </Button>
        </div>
      </section>

      <section className="settings-section">
        <h2>Music I enjoy</h2>
        <div className="chip-grid">
          {musicOptions.map((option) => (
            <Button
              key={option}
              size="xl"
              variant={preferences.music.includes(option) ? "default" : "outline"}
              onClick={() => void savePreferences({ music: toggle(preferences.music, option) })}
            >
              {option}
            </Button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h2>People I like to talk with</h2>
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
            onClick={async () => {
              await savePreferences({
                people: [
                  ...people,
                  { name: personName.trim(), relationship: relationship.trim() || "Friend" },
                ],
              });
              setPersonName("");
              setRelationship("");
            }}
          >
            Add
          </Button>
        </div>
        {people.map((person) => (
          <div className="entry-row" key={`${person.name}-${person.relationship}`}>
            <p className="saved-line">
              {person.name} · {person.relationship}
            </p>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                void savePreferences({
                  people: people.filter(
                    (item) => !(item.name === person.name && item.relationship === person.relationship),
                  ),
                })
              }
            >
              Remove
            </Button>
          </div>
        ))}
      </section>

      <section className="settings-section">
        <h2>Things I enjoy</h2>
        <div className="chip-grid">
          {interestOptions.map((option) => (
            <Button
              key={option}
              size="xl"
              variant={preferences.interests.includes(option) ? "default" : "outline"}
              onClick={() => void savePreferences({ interests: toggle(preferences.interests, option) })}
            >
              {option}
            </Button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h2>Text size</h2>
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
      </section>

      <section className="settings-section">
        <h2>PACE speaking aloud</h2>
        <div className="chip-grid">
          <Button
            size="xl"
            variant={accessibility.voiceInstructions ? "default" : "outline"}
            onClick={() => setAccessibility({ ...accessibility, voiceInstructions: true })}
          >
            On
          </Button>
          <Button
            size="xl"
            variant={!accessibility.voiceInstructions ? "default" : "outline"}
            onClick={() => setAccessibility({ ...accessibility, voiceInstructions: false })}
          >
            Off
          </Button>
        </div>
        <Link to="/accessibility" className="simple-note">
          More comfort options
        </Link>
      </section>

      <section className="settings-section">
        <h2>My account</h2>
        <Button size="xl" variant="outline" onClick={() => void signOut()}>
          Sign out
        </Button>
        <p className="simple-note">
          PACE keeps only your name, your choices, and the notes your care team adds. You can delete
          all of it whenever you like.
        </p>
        {!confirmDelete ? (
          <Button size="xl" variant="outline" onClick={() => setConfirmDelete(true)}>
            Delete my information
          </Button>
        ) : (
          <div className="senior-confirm">
            <p>This removes your account and everything saved with it. This cannot be undone.</p>
            <div className="senior-controls-group">
              <Button size="xl" variant="destructive" onClick={() => void removeEverything()}>
                Yes, delete everything
              </Button>
              <Button size="xl" variant="outline" onClick={() => setConfirmDelete(false)}>
                No, keep my information
              </Button>
            </div>
          </div>
        )}
      </section>

      {saved && (
        <p className="pace-reply" role="status">
          {saved}
        </p>
      )}
    </div>
  );
}
