import { supabase } from "@/integrations/supabase/client";

export type CreationKind = "drawing" | "story" | "message";

export type PaceCreation = {
  id: string;
  resident_id: string;
  kind: CreationKind;
  title: string;
  content: string;
  shared_with_staff: boolean;
  shared_with_family: boolean;
  created_at: string;
};

export async function saveCreation(input: {
  residentId: string;
  kind: CreationKind;
  title: string;
  content: string;
}) {
  const { data, error } = await supabase
    .from("pace_creations")
    .insert({
      resident_id: input.residentId,
      kind: input.kind,
      title: input.title,
      content: input.content,
    })
    .select()
    .single();
  if (error) return null;
  return data as PaceCreation;
}

export async function listCreations(residentId: string, kind: CreationKind) {
  const { data } = await supabase
    .from("pace_creations")
    .select("*")
    .eq("resident_id", residentId)
    .eq("kind", kind)
    .order("created_at", { ascending: false });
  return (data ?? []) as PaceCreation[];
}

export async function shareCreation(id: string, patch: { staff?: boolean; family?: boolean }) {
  const update: { shared_with_staff?: boolean; shared_with_family?: boolean } = {};
  if (patch.staff !== undefined) update.shared_with_staff = patch.staff;
  if (patch.family !== undefined) update.shared_with_family = patch.family;
  await supabase.from("pace_creations").update(update).eq("id", id);
}

export async function deleteCreation(id: string) {
  await supabase.from("pace_creations").delete().eq("id", id);
}

const FAMILY_KEY = "pace-family-sharing";

export function familySharingOn() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(FAMILY_KEY) === "yes";
}

export function setFamilySharing(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAMILY_KEY, on ? "yes" : "no");
}
