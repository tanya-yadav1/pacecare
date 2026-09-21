export type PaceIntent = "listen" | "connect" | "explore" | "quiet" | "unknown";

export function understandPaceChoice(text: string): {
  intent: PaceIntent;
  reply: string;
  path: "/music" | "/community" | "/mind-body" | "/relax" | null;
} {
  const words = text.toLowerCase();
  if (/music|song|listen|favorite/.test(words))
    return {
      intent: "listen",
      reply: "Would you like one of your favorite songs?",
      path: "/music",
    };
  if (/daughter|son|family|friend|talk|call|people|together|connect/.test(words))
    return {
      intent: "connect",
      reply: "Of course. Let’s choose someone or something social.",
      path: "/community",
    };
  if (/new|explore|activity|something to do|try/.test(words))
    return {
      intent: "explore",
      reply: "Let’s find something that feels interesting today.",
      path: "/mind-body",
    };
  if (/quiet|relax|rest|nothing|calm|tired/.test(words))
    return {
      intent: "quiet",
      reply: "That’s completely okay. We can have a quiet moment.",
      path: "/relax",
    };
  return {
    intent: "unknown",
    reply: "I heard you. Would you like to listen, connect, explore, or have some quiet?",
    path: null,
  };
}
