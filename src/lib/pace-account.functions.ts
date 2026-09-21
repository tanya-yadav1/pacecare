import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Permanently removes the signed-in person's PACE account and everything saved with it. */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    await supabaseAdmin.from("pace_events").delete().eq("resident_id", userId);
    await supabaseAdmin.from("senior_pins").delete().eq("user_id", userId);
    await supabaseAdmin.from("resident_assignments").delete().eq("resident_id", userId);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) return { ok: false as const, message: "PACE could not delete the account just now." };
    return { ok: true as const, message: "Everything has been deleted." };
  });
