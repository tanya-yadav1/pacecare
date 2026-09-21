import { supabase } from "@/integrations/supabase/client";

export type PaceEventKind = "help" | "choice" | "activity";
export type PaceEventStatus = "new" | "in_progress" | "done";

export type PaceEvent = {
  id: string;
  resident_id: string;
  kind: PaceEventKind;
  label: string;
  detail: string | null;
  status: PaceEventStatus;
  staff_note: string | null;
  created_at: string;
};

/** Records something a senior asked for or did, so staff can see it right away. */
export async function recordEvent(input: {
  residentId: string;
  kind: PaceEventKind;
  label: string;
  detail?: string;
}) {
  const { data, error } = await supabase
    .from("pace_events")
    .insert({
      resident_id: input.residentId,
      kind: input.kind,
      label: input.label,
      detail: input.detail ?? null,
      status: input.kind === "activity" ? "done" : "new",
    })
    .select()
    .single();
  if (error) return null;
  return data as PaceEvent;
}

export async function listMyEvents(residentId: string) {
  const { data } = await supabase
    .from("pace_events")
    .select("*")
    .eq("resident_id", residentId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as PaceEvent[];
}

export async function listAllEvents() {
  const { data } = await supabase
    .from("pace_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as PaceEvent[];
}

export async function setEventStatus(id: string, status: PaceEventStatus) {
  await supabase
    .from("pace_events")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export function friendlyStatus(event: PaceEvent) {
  if (event.status === "done") return `Done: ${event.label}`;
  if (event.status === "in_progress") return `${event.label} — someone is helping you right now.`;
  return `${event.label} — we have told the team.`;
}
