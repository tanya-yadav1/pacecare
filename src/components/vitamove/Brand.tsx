import parkerAsset from "@/assets/vitamove-parker.avif.asset.json";
import paceLogo from "@/assets/pace-connection-logo.png";
import { cn } from "@/lib/utils";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={paceLogo}
        alt="PACE connection mark with two people"
        width={1024}
        height={1024}
        className={
          compact ? "h-14 w-14 rounded-md object-contain" : "h-16 w-16 rounded-md object-contain"
        }
      />
      <div className="leading-tight">
        <strong className="text-xl text-primary sm:text-2xl">PACE</strong>
        <span className="hidden text-sm font-bold text-muted-foreground sm:block">
          Personalized Aging &amp; Connection Experience
        </span>
        <small className="hidden font-bold text-primary sm:block">
          Your voice. Your choice. Your moment.
        </small>
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
      <img src={parkerAsset.url} alt={`Parker companion wearing ${skin} style`} />
    </div>
  );
}
