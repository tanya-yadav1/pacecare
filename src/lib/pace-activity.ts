import { useCallback, useState } from "react";
import { usePaceAuth } from "@/lib/pace-auth";
import { recordEvent } from "@/lib/pace-events";
import { primeSpeechForGesture, speakImmediatelyOnGesture, speakInstructions } from "@/lib/speech";

/** Speaks a short line out loud, using PACE's own voice if the device has none. */
export function sayAloud(text: string) {
  if (speakImmediatelyOnGesture(text)) return;
  primeSpeechForGesture();
  void speakInstructions(text).catch(() => {});
}

/**
 * Every activity button uses this: it shows a message, says it out loud, and
 * writes the choice to the staff activity log.
 */
export function useActivityActions(activity: string) {
  const { user, profile } = usePaceAuth();
  const [status, setStatus] = useState("");
  const who = profile?.greeting_name || profile?.display_name || "A resident";

  const announce = useCallback((text: string) => {
    setStatus(text);
    sayAloud(text);
  }, []);

  const logActivity = useCallback(
    (label: string, detail?: string) => {
      if (!user?.id) return;
      void recordEvent({ residentId: user.id, kind: "activity", label, detail: detail ?? activity });
    },
    [user?.id, activity],
  );

  /** For anything that needs a person: creates a request staff can act on. */
  const askStaff = useCallback(
    (wish: string, spoken?: string) => {
      if (user?.id) void recordEvent({ residentId: user.id, kind: "choice", label: `${who} ${wish}`, detail: activity });
      const text = spoken ?? "Staff have been told. Someone will help you soon.";
      setStatus(text);
      sayAloud(text);
    },
    [user?.id, who, activity],
  );

  /** Does the thing inside the app, tells the senior, and logs it. */
  const doHere = useCallback(
    (label: string, spoken: string) => {
      setStatus(spoken);
      sayAloud(spoken);
      if (user?.id) void recordEvent({ residentId: user.id, kind: "activity", label, detail: activity });
    },
    [user?.id, activity],
  );

  return { status, setStatus, announce, logActivity, askStaff, doHere, who };
}
