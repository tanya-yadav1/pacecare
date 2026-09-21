import { useState } from "react";
import { Heart, Meh, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness, type ConnectionMoment } from "@/lib/lumastride-wellness";

export function ExperienceFeedback({ choice, title }: { choice: ConnectionMoment["choice"]; title: string }) {
  const { addMoment, rateMoment } = useLumaStrideWellness();
  const [saved, setSaved] = useState<ConnectionMoment["feedback"]>();
  const choose = (feedback: NonNullable<ConnectionMoment["feedback"]>) => {
    const id = addMoment({ choice, title });
    rateMoment(id, feedback);
    setSaved(feedback);
  };
  if (saved) return <section className="feedback-panel" role="status"><Heart/><div><h2>Thank you for telling us.</h2><p>PACE will remember that “{title}” was {saved.toLowerCase()}.</p></div></section>;
  return <section className="feedback-panel"><div><p className="eyebrow">Your voice matters</p><h2>How was that?</h2></div><div className="feedback-choices"><Button size="xl" onClick={() => choose("Loved it")}><Heart/>Loved it</Button><Button size="xl" variant="outline" onClick={() => choose("It was okay")}><Meh/>It was okay</Button><Button size="xl" variant="outline" onClick={() => choose("Not for me")}><ThumbsDown/>Not for me</Button></div></section>;
}