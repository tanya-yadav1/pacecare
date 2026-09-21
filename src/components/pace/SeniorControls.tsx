import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Contrast, House, LifeBuoy, Type } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { recordEvent } from "@/lib/pace-events";
import { usePaceAuth } from "@/lib/pace-auth";

const sizes = [
  { key: "standard", label: "A" },
  { key: "large", label: "A+" },
  { key: "extra-large", label: "A++" },
] as const;

/** Back, Home, Help and comfort controls that stay on every senior screen. */
export function SeniorControls() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { accessibility, setAccessibility } = useLumaStrideWellness();
  const { user } = usePaceAuth();
  const [asking, setAsking] = useState(false);
  const [sent, setSent] = useState(false);

  const askForHelp = async () => {
    if (user?.id) await recordEvent({ residentId: user.id, kind: "help", label: `Needs help on ${path}` });
    setAsking(false);
    setSent(true);
    window.setTimeout(() => setSent(false), 8000);
  };

  return (
    <div className="senior-controls">
      <div className="senior-controls-group">
        <Button size="xl" variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft aria-hidden />
          Back
        </Button>
        <Button size="xl" variant="outline" asChild>
          <Link to="/">
            <House aria-hidden />
            Home
          </Link>
        </Button>
      </div>
      <div className="senior-controls-group">
        <span className="senior-controls-label">
          <Type aria-hidden /> Text size
        </span>
        {sizes.map((size) => (
          <Button
            key={size.key}
            size="xl"
            variant={accessibility.textSize === size.key ? "default" : "outline"}
            aria-pressed={accessibility.textSize === size.key}
            aria-label={`Text size ${size.label}`}
            onClick={() => setAccessibility({ ...accessibility, textSize: size.key })}
          >
            {size.label}
          </Button>
        ))}
        <Button
          size="xl"
          variant={accessibility.highContrast ? "default" : "outline"}
          aria-pressed={accessibility.highContrast}
          onClick={() => setAccessibility({ ...accessibility, highContrast: !accessibility.highContrast })}
        >
          <Contrast aria-hidden />
          High contrast
        </Button>
        <Button size="xl" variant="secondary" onClick={() => setAsking(true)}>
          <LifeBuoy aria-hidden />
          Help
        </Button>
      </div>
      {asking && (
        <div className="senior-confirm" role="dialog" aria-label="Ask staff for help">
          <p>Would you like us to ask a staff member to come and help you?</p>
          <div className="senior-controls-group">
            <Button size="xl" onClick={() => void askForHelp()}>
              Yes, please ask
            </Button>
            <Button size="xl" variant="outline" onClick={() => setAsking(false)}>
              No, not now
            </Button>
          </div>
        </div>
      )}
      {sent && (
        <p className="pace-reply" role="status">
          A staff member has been told. Someone will be with you soon.
        </p>
      )}
    </div>
  );
}
