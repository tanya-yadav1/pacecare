import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useActivityActions } from "@/lib/pace-activity";

/**
 * The frame every activity page shares: a title, a live message area, and a
 * big "I'm done for now" button. Back, Home and Help sit in the senior
 * controls bar just above, so they are never duplicated here.
 */
export function ActivityShell({
  activity,
  eyebrow,
  title,
  lead,
  status,
  children,
}: {
  activity: string;
  eyebrow: string;
  title: string;
  lead?: string;
  status?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { doHere } = useActivityActions(activity);

  const finish = () => {
    doHere(`Finished ${activity}`, `Well done. Thank you for spending time with ${activity.toLowerCase()}.`);
    window.setTimeout(() => void navigate({ to: "/" }), 900);
  };

  return (
    <div className="activity-page">
      <header className="activity-header">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {lead && <p className="simple-lead">{lead}</p>}
      </header>
      {status ? (
        <p className="activity-status" role="status" aria-live="polite">
          {status}
        </p>
      ) : (
        <p className="activity-status activity-status-empty" role="status" aria-live="polite" />
      )}
      {children}
      <div className="activity-finish">
        <Button size="xl" variant="secondary" onClick={finish}>
          <CheckCircle2 aria-hidden />
          I&apos;m done for now
        </Button>
      </div>
    </div>
  );
}
