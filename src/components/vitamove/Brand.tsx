import parkerAsset from "@/assets/vitamove-parker.avif.asset.json";
import asterStepLogo from "@/assets/asterstep-logo.png";
import { cn } from "@/lib/utils";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3"><img src={asterStepLogo} alt="AsterStep helping hands and rising star logo" width={1024} height={1024} className={compact ? "h-14 w-14 object-contain" : "h-16 w-16 object-contain"}/><div className="leading-tight"><strong className="text-xl text-primary sm:text-2xl">AsterStep</strong><span className="hidden text-sm font-bold text-muted-foreground sm:block">Move to your own rhythm</span></div></div>;
}
export function AvatarFigure({ skin = "classic", className }: { skin?: "classic" | "leopard" | "holiday"; className?: string }) {
  return <div className={cn("avatar-frame", `skin-${skin}`, className)}><img src={parkerAsset.url} alt={`Parker companion wearing ${skin} style`} /></div>;
}
