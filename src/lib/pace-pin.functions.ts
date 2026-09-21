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

/** The fictional demonstration residents anyone can try. All details are invented. */
type DemoResident = {
  email: string;
  pin: string;
  displayName: string;
  greetingName: string;
  birthYear: number;
  favoriteGenres: string[];
  preferences: Record<string, unknown>;
};

const DEMO_RESIDENTS: DemoResident[] = [
  {
    email: "eleanor@pacedemo.app",
    pin: "1234",
    displayName: "Eleanor Brooks",
    greetingName: "Eleanor",
    birthYear: 1948,
    favoriteGenres: ["Gospel", "Country", "Big Band"],
    preferences: {
      music: ["Gospel", "Country", "Big Band"],
      people: [
        { name: "Maya", relationship: "Daughter" },
        { name: "Samuel", relationship: "Neighbor" },
      ],
      interests: ["Gardening", "Stories", "Birds"],
      onboarded: true,
      tileUsage: { Listen: 3, Connect: 2 },
    },
  },
  {
    email: "walter@pacedemo.app",
    pin: "2345",
    displayName: "Walter Nash",
    greetingName: "Walter",
    birthYear: 1938,
    favoriteGenres: ["Jazz", "Classical"],
    preferences: {
      music: ["Jazz", "Classical"],
      people: [{ name: "Ruth", relationship: "Niece" }],
      interests: ["Records", "Chess", "Trains"],
      onboarded: true,
      tileUsage: { Listen: 5 },
    },
  },
  {
    email: "rosa@pacedemo.app",
    pin: "3456",
    displayName: "Rosa Delgado",
    greetingName: "Rosa",
    birthYear: 1955,
    favoriteGenres: ["Soul", "Folk"],
    preferences: {
      music: ["Soul", "Folk"],
      people: [{ name: "Ana", relationship: "Daughter" }],
      interests: ["Cooking", "Dancing", "Poetry"],
      onboarded: true,
      tileUsage: { Listen: 2, Explore: 1 },
    },
  },
];

const DEMO_EMAIL = DEMO_RESIDENTS[0]!.email;

/** Creates a fictional demo resident the first time someone signs in with their PIN. */
async function ensureDemoPerson(person: DemoResident) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: existing } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", person.email)
    .maybeSingle();

  let userId = existing?.id ?? null;

  if (!userId) {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: person.email,
      email_confirm: true,
      user_metadata: { display_name: person.displayName, role: "senior" },
    });
    if (error || !created.user) return null;
    userId = created.user.id;
  }

  await supabaseAdmin.from("profiles").upsert({
    id: userId,
    email: person.email,
    display_name: person.displayName,
    greeting_name: person.greetingName,
    birth_year: person.birthYear,
    favorite_genres: person.favoriteGenres,
    preferences: person.preferences as never,
  });

  await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "senior" }, { onConflict: "user_id,role" });

  await supabaseAdmin.from("senior_pins").upsert({
    user_id: userId,
    pin_hash: hashPin(userId, person.pin),
    set_by: userId,
    updated_at: new Date().toISOString(),
  });

  return userId;
}

/** Makes sure the first fictional resident exists (used by the staff demo account). */
async function ensureDemoResident() {
  return ensureDemoPerson(DEMO_RESIDENTS[0]!);
}

/** The fictional demonstration staff member anyone can try. */
const DEMO_STAFF_EMAIL = "sam@pacedemo.app";

/** Signs the visitor into the fictional demo staff account, creating it the first time. */
export const signInAsDemoStaff = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: existing } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", DEMO_STAFF_EMAIL)
    .maybeSingle();

  let userId = existing?.id ?? null;
  if (!userId) {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_STAFF_EMAIL,
      email_confirm: true,
      user_metadata: { display_name: "Sam Rivera", role: "staff" },
    });
    if (error || !created.user) {
      return { ok: false as const, message: "PACE could not open the demo staff account." };
    }
    userId = created.user.id;
  }

  await supabaseAdmin.from("profiles").upsert({
    id: userId,
    email: DEMO_STAFF_EMAIL,
    display_name: "Sam Rivera",
    greeting_name: "Sam",
  });
  await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "staff" }, { onConflict: "user_id,role" });

  const residentId = await ensureDemoResident();
  if (residentId) {
    await supabaseAdmin
      .from("resident_assignments")
      .upsert(
        { staff_id: userId, resident_id: residentId },
        { onConflict: "staff_id,resident_id" },
      );
  }

  const { data: link, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: DEMO_STAFF_EMAIL,
  });
  if (linkError || !link?.properties?.hashed_token) {
    return { ok: false as const, message: "PACE could not sign you in just now." };
  }
  return { ok: true as const, tokenHash: link.properties.hashed_token };
});

/** Signs a senior in with the 4-digit PIN a caregiver set for them. */
export const signInWithPin = createServerFn({ method: "POST" })
  .inputValidator((input: { email?: string; pin: string }) =>
    z.object({ email: emailSchema.optional().or(z.literal("")), pin: pinSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    // With no email typed, a demo PIN opens that fictional resident's account.
    const byPin = DEMO_RESIDENTS.find((person) => person.pin === data.pin);
    const typed = data.email?.trim().toLowerCase();
    const email = (typed || byPin?.email || DEMO_EMAIL).toLowerCase();
    const demoPerson = DEMO_RESIDENTS.find(
      (person) => person.email === email && person.pin === data.pin,
    );
    if (demoPerson) await ensureDemoPerson(demoPerson);
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
      return {
        ok: true as const,
        message: "Staff PIN saved. Use it every time you enter Staff Mode.",
      };
    }

    if (pinRow.pin_hash !== hashPin(context.userId, data.pin)) {
      return { ok: false as const, message: "That PIN did not match." };
    }
    return { ok: true as const, message: "Welcome to Staff Mode." };
  });
