import { createFileRoute } from "@tanstack/react-router";
import { Coffee, Mic, PenLine, Send, Square, Users } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExperienceFeedback } from "@/components/pace/ExperienceFeedback";
import { useActivityActions } from "@/lib/pace-activity";
import { usePaceAuth } from "@/lib/pace-auth";
import { saveCreation } from "@/lib/pace-creations";
import mayaPhoto from "@/assets/person-maya.jpg";
import samuelPhoto from "@/assets/person-samuel.jpg";
import familyPhoto from "@/assets/person-family.jpg";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Connect — PACE" },
      { name: "description", content: "Choose a familiar person or a welcoming shared activity." },
      { property: "og:title", content: "Connect — PACE" },
      { property: "og:description", content: "Simple, senior-controlled ways to connect." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Connect,
});

const people = [
  { name: "Maya", relationship: "Your daughter", photo: mayaPhoto },
  { name: "Samuel", relationship: "Your neighbor", photo: samuelPhoto },
  { name: "The family group", relationship: "Everyone together", photo: familyPhoto },
];

const groups = [
  { title: "Garden listening circle", detail: "Today at 2:00", Icon: Users },
  { title: "Coffee & stories", detail: "Today at 3:30", Icon: Coffee },
];

function Connect() {
  const { user } = usePaceAuth();
  const { status, announce, askStaff } = useActivityActions("Connect");
  const [chosen, setChosen] = useState<string | null>(null);
  const [writing, setWriting] = useState(false);
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);

  const ask = (person: string, how: "call" | "message") => {
    setChosen(person);
    askStaff(
      how === "call" ? `would like to call ${person}` : `would like to send a message to ${person}`,
      how === "call"
        ? `Staff have been told. Someone will help you call ${person} soon.`
        : `Your message for ${person} has been sent to staff.`,
    );
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      announce("Please write a few words first.");
      return;
    }
    if (user?.id) {
      await saveCreation({
        residentId: user.id,
        kind: "message",
        title: `Message for ${chosen ?? "family"}`,
        content: message.trim(),
      });
    }
    setMessage("");
    setWriting(false);
    askStaff(
      `has written a message for ${chosen ?? "family"}`,
      "Your message has been given to staff. They will deliver it for you.",
    );
  };

  const recordVoice = async () => {
    if (recording) {
      recorder.current?.stop();
      recorder.current?.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      announce("This device cannot record sound. Staff can take your message instead.");
      askStaff("would like to send a spoken message");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const media = new MediaRecorder(stream);
      chunks.current = [];
      media.ondataavailable = (event) => chunks.current.push(event.data);
      media.onstop = () => {
        const blob = new Blob(chunks.current, { type: media.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onload = async () => {
          if (user?.id) {
            await saveCreation({
              residentId: user.id,
              kind: "message",
              title: `Voice message for ${chosen ?? "family"}`,
              content: String(reader.result),
            });
          }
          askStaff(
            `has recorded a voice message for ${chosen ?? "family"}`,
            "Your voice message has been given to staff. They will deliver it for you.",
          );
        };
        reader.readAsDataURL(blob);
      };
      recorder.current = media;
      media.start();
      setRecording(true);
      announce("Recording your message. Press stop when you are finished.");
    } catch {
      announce("PACE needs permission to use the microphone. Staff can take your message instead.");
    }
  };

  return (
    <div className="simple-page wide">
      <p className="eyebrow">Connect</p>
      <h1>Who would you like to be with?</h1>
      <p className="simple-lead">You are always in control of who PACE contacts.</p>
      <p className="activity-status" role="status" aria-live="polite">
        {status}
      </p>

      <div className="people-grid">
        {people.map((person) => (
          <article key={person.name} className={`person-card${chosen === person.name ? " is-chosen" : ""}`}>
            <button
              type="button"
              className="person-photo"
              onClick={() => ask(person.name, "call")}
              aria-label={`Ask staff to help me call ${person.name}, ${person.relationship}`}
            >
              <img src={person.photo} alt={person.name} loading="lazy" width={816} height={816} />
            </button>
            <h2>{person.name}</h2>
            <p>{person.relationship}</p>
            <div className="activity-actions">
              <Button size="lg" onClick={() => ask(person.name, "call")}>
                Call {person.name}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setChosen(person.name);
                  setWriting(true);
                  announce(`Write a message for ${person.name}.`);
                }}
              >
                <PenLine aria-hidden />
                Write a message
              </Button>
              <Button
                size="lg"
                variant={recording && chosen === person.name ? "default" : "outline"}
                onClick={() => {
                  setChosen(person.name);
                  void recordVoice();
                }}
              >
                {recording && chosen === person.name ? <Square aria-hidden /> : <Mic aria-hidden />}
                {recording && chosen === person.name ? "Stop recording" : "Record a voice message"}
              </Button>
            </div>
          </article>
        ))}
      </div>

      {writing && (
        <section className="message-writer">
          <label htmlFor="pace-message">Your message for {chosen}</label>
          <textarea
            id="pace-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            placeholder="Thinking of you today…"
          />
          <div className="activity-actions">
            <Button size="xl" onClick={() => void sendMessage()}>
              <Send aria-hidden />
              Give my message to staff
            </Button>
            <Button size="xl" variant="outline" onClick={() => setWriting(false)}>
              Not now
            </Button>
          </div>
        </section>
      )}

      <section className="group-invites">
        <h2>Happening today</h2>
        <div className="activity-grid">
          {groups.map(({ title, detail, Icon }) => (
            <Button
              key={title}
              variant="outline"
              onClick={() => {
                setChosen(title);
                askStaff(`would like to join ${title}`, `Staff have been told you would like to join ${title}.`);
              }}
            >
              <Icon />
              <span>
                <strong>{title}</strong>
                <small>{detail}</small>
              </span>
            </Button>
          ))}
        </div>
      </section>

      {chosen && <ExperienceFeedback choice="Connect" title={chosen} />}
    </div>
  );
}
