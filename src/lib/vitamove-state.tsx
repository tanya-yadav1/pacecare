import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Skin = "classic" | "leopard" | "holiday";
type ParkerMessage = { id: number; text: string; from: "parker" | "user" };
type VitaState = {
  stars: number; skin: Skin; movementClaimed: boolean; therapyClaimed: boolean;
  parkerOpen: boolean; messages: ParkerMessage[]; banner: string | null;
  setSkin: (skin: Skin) => void; awardMovement: () => void; awardTherapy: () => void;
  awardCommunity: (name: string) => void; setParkerOpen: (open: boolean) => void;
  sendToParker: (text: string) => void; dismissBanner: () => void;
};

const Context = createContext<VitaState | null>(null);
const milestone = "🎉 Milestone Reached! +40 Stars Earned. NEW AVATAR SKIN UNLOCKED!";

export function VitaMoveProvider({ children }: { children: ReactNode }) {
  const [stars, setStars] = useState(120);
  const [skin, setSkinState] = useState<Skin>("classic");
  const [movementClaimed, setMovementClaimed] = useState(false);
  const [therapyClaimed, setTherapyClaimed] = useState(false);
  const [parkerOpen, setParkerOpen] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [messages, setMessages] = useState<ParkerMessage[]>([{ id: 1, from: "parker", text: "hi I'm Parker" }]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("vitamove-state") ?? "null");
      if (saved) {
        setStars(saved.stars ?? 120); setSkinState(saved.skin ?? "classic");
        setMovementClaimed(Boolean(saved.movementClaimed)); setTherapyClaimed(Boolean(saved.therapyClaimed));
      }
    } catch { /* keep safe defaults */ }
  }, []);
  useEffect(() => {
    localStorage.setItem("vitamove-state", JSON.stringify({ stars, skin, movementClaimed, therapyClaimed }));
  }, [stars, skin, movementClaimed, therapyClaimed]);

  const celebrate = () => {
    setBanner(milestone); setParkerOpen(true);
    setMessages((m) => [...m, { id: Date.now(), from: "parker", text: "Sensational work on today's movement session! You just earned 40 stars and unlocked a new skin in the Wellness Store! Go check it out! 🌟" }]);
  };
  const awardMovement = () => { if (movementClaimed) return; setMovementClaimed(true); setStars((s) => s + 40); celebrate(); };
  const awardTherapy = () => { if (therapyClaimed) return; setTherapyClaimed(true); setStars((s) => s + 40); celebrate(); };
  const awardCommunity = (name: string) => { setStars((s) => s + 5); setBanner(`🎉 Support Sent! You encouraged ${name} and earned +5 Wellness Stars for fostering community!`); };
  const sendToParker = (text: string) => {
    const lower = text.toLowerCase();
    const reply = lower.includes("tremor") ? "A resting tremor can have many causes. Use the screener for guidance, and discuss new or changing symptoms with a qualified clinician." : lower.includes("reward") || lower.includes("star") ? "Your Wellness Stars and avatar skins are in the Rewards page." : lower.includes("assessment") || lower.includes("screen") ? "Open Screening in the top navigation to find the risk screener and kinetic tests." : "I can help you find the Dashboard, Screening, Therapy, Rewards, Clinician View, or Community.";
    setMessages((m) => [...m, { id: Date.now(), from: "user", text }, { id: Date.now() + 1, from: "parker", text: reply }]);
  };
  const value = useMemo(() => ({ stars, skin, movementClaimed, therapyClaimed, parkerOpen, messages, banner, setSkin: setSkinState, awardMovement, awardTherapy, awardCommunity, setParkerOpen, sendToParker, dismissBanner: () => setBanner(null) }), [stars, skin, movementClaimed, therapyClaimed, parkerOpen, messages, banner]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useVitaMove() { const value = useContext(Context); if (!value) throw new Error("VitaMoveProvider missing"); return value; }
