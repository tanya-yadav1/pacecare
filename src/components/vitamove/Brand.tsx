import { cn } from "@/lib/utils";

export function PaceLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pace-logo-mark", className)}
      role="img"
      aria-label="PACE mark: a person moving forward along a path"
    >
      <path
        d="M40 90V45C40 33.9543 48.9543 25 60 25C71.0457 25 80 33.9543 80 45C80 56.0457 71.0457 65 60 65H40"
        stroke="var(--logo-path)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 75V45C40 33.9543 48.9543 25 60 25"
        stroke="var(--logo-accent)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle
        cx="60"
        cy="65"
        r="14"
        fill="var(--logo-dot)"
        opacity="0.2"
      />
      <circle
        cx="60"
        cy="65"
        r="9"
        fill="var(--logo-dot)"
        className="pace-logo-dot"
      />
    </svg>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "brand-lockup",
        compact ? "brand-lockup-compact" : "brand-lockup-default"
      )}
    >
      <PaceLogo className={compact ? "h-12 w-12" : "h-[4.5rem] w-[4.5rem]"} />
      <div className="brand-text">
        <span className="brand-title">PACE</span>
        {!compact && (
          <span className="brand-subtitle">
            Personalized Aging &amp; Connection Experience
          </span>
        )}
      </div>
    </div>
  );
}

export function AvatarFigure({
  skin = "classic",
  className,
}: {
  skin?: "classic" | "leopard" | "holiday";
  className?: string;
}) {
  return (
    <div className={cn("avatar-frame", `skin-${skin}`, className)}>
      <div className="avatar-placeholder" aria-label={`Parker companion wearing ${skin} style`}>
        <PaceLogo className="h-16 w-16" />
      </div>
    </div>
  );
}
