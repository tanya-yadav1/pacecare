import parkerAsset from "@/assets/vitamove-parker.avif.asset.json";
import { cn } from "@/lib/utils";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3"><img src={parkerAsset.url} alt="VitaMove athletic figure reaching for a golden star" className={compact ? "h-14 w-14 rounded-full object-cover object-top" : "h-16 w-16 object-contain"}/><div className="hidden leading-tight sm:block"><strong className="text-xl text-primary">VitaMove</strong><span className="block text-sm font-bold uppercase text-foreground">Parkinson's</span></div></div>;
}
export function AvatarFigure({ skin = "classic", className }: { skin?: "classic" | "leopard" | "holiday"; className?: string }) {
  return <div className={cn("avatar-frame", `skin-${skin}`, className)}><img src={parkerAsset.url} alt={`Parker companion wearing ${skin} style`} /></div>;
}
