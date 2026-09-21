import { createServerFn } from "@tanstack/react-start";
import { createHash } from "crypto";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const emailSchema = z.string().trim().email().max(200);
const pinSchema = z.string().regex(/^\d{4}$/, "PIN must be 4 digits");

function hashPin(userId: string, pin: string) {
  return createHash("sha256").update(`${userId}:${pin}`).digest("hex");
}

// Simple per-worker throttle so a PIN cannot be brute-forced quickly.
const attempts = new Map<string, { count: number; first: number }>();
function tooManyAttempts(email: string) {
  const now = Date.now();
  const record = attempts.get(email);
  if (!record || now - record.first > 10 * 60 * 1000) {
    attempts.set(email, { count: 1, first: now });
    return false;
  }
  record.count += 1;
  return record.count > 6;
}

/** Signs a senior in with the 4-digit PIN a caregiver set for them. */
export const signInWithPin = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; pin: string }) =>
    z.object({ email: emailSchema, pin: pinSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    if (tooManyAttempts(email)) {
      return { ok: false as const, message: "Too many tries. Please wait a few minutes." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!profile) return { ok: false as const, message: "That email and PIN did not match." };

    const { data: pinRow } = await supabaseAdmin
      .from("senior_pins")
      .select("pin_hash")
      .eq("user_id", profile.id)
      .maybeSingle();

    if (!pinRow || pinRow.pin_hash !== hashPin(profile.id, data.pin)) {
      return { ok: false as const, message: "That email and PIN did not match." };
    }

    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (error || !link?.properties?.hashed_token) {
      return { ok: false as const, message: "PACE could not sign you in just now." };
    }

    attempts.delete(email);
    return { ok: true as const, tokenHash: link.properties.hashed_token };
  });

/** Staff set or clear the PIN for a resident they care for. */
export const setResidentPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; pin: string | null }) =>
    z.object({ email: emailSchema, pin: pinSchema.nullable() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isStaff } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "staff",
    });
    if (!isStaff) return { ok: false as const, message: "Only staff can set a resident PIN." };

    const email = data.email.toLowerCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (!profile) return { ok: false as const, message: "No PACE account uses that email yet." };

    const { data: seniorRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", profile.id)
      .eq("role", "senior")
      .maybeSingle();
    if (!seniorRole) return { ok: false as const, message: "That account is not a resident." };

    await supabaseAdmin
      .from("resident_assignments")
      .upsert(
        { staff_id: context.userId, resident_id: profile.id },
        { onConflict: "staff_id,resident_id" },
      );

    if (data.pin === null) {
      await supabaseAdmin.from("senior_pins").delete().eq("user_id", profile.id);
      return { ok: true as const, message: "PIN removed." };
    }

    await supabaseAdmin.from("senior_pins").upsert({
      user_id: profile.id,
      pin_hash: hashPin(profile.id, data.pin),
      set_by: context.userId,
      updated_at: new Date().toISOString(),
    });

    return { ok: true as const, message: "PIN saved for this resident." };
  });

/**
 * Confirms the staff PIN before anyone enters Staff Mode.
 * The first time a staff member does this, the PIN they type becomes their PIN.
 */
export const confirmStaffPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { pin: string }) => z.object({ pin: pinSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isStaff } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "staff",
    });
    if (!isStaff) return { ok: false as const, message: "This account is not a staff account." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: pinRow } = await supabaseAdmin
      .from("senior_pins")
      .select("pin_hash")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (!pinRow) {
      await supabaseAdmin.from("senior_pins").upsert({
        user_id: context.userId,
        pin_hash: hashPin(context.userId, data.pin),
        set_by: context.userId,
        updated_at: new Date().toISOString(),
      });
      return { ok: true as const, message: "Staff PIN saved. Use it every time you enter Staff Mode." };
    }

    if (pinRow.pin_hash !== hashPin(context.userId, data.pin)) {
      return { ok: false as const, message: "That PIN did not match." };
    }
    return { ok: true as const, message: "Welcome to Staff Mode." };
  });
