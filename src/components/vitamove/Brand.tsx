import parkerAsset from "@/assets/vitamove-parker.avif.asset.json";
import paceLogo from "@/assets/pace-logo.png";
import { cn } from "@/lib/utils";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3"><img src={paceLogo} alt="PACE human figure in motion" width={1024} height={1024} className={compact ? "h-14 w-14 object-contain" : "h-16 w-16 object-contain"}/><div className="leading-tight"><strong className="text-xl text-primary sm:text-2xl">PACE</strong><span className="hidden text-sm font-bold text-muted-foreground sm:block">Parkinson's Adaptive Care and Exercise</span></div></div>;
}
export function AvatarFigure({ skin = "classic", className }: { skin?: "classic" | "leopard" | "holiday"; className?: string }) {
  return <div className={cn("avatar-frame", `skin-${skin}`, className)}><img src={parkerAsset.url} alt={`Parker companion wearing ${skin} style`} /></div>;
}
