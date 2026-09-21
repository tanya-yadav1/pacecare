# PACE — Part 1: Accounts, Roles and Personalization

Adds real sign-in to PACE with two clearly separated experiences: seniors and staff. Everything else in the app keeps its current warm tone, voice-first home screen, and the disclaimer that PACE supports personal choice and connection and does not diagnose, cure, or treat any condition. All resident content stays fictional demo data.

## Sign-in experiences

**Senior sign-in (`/auth`)**
- One enormous email field and one big "Send my sign-in link" button. PACE reads the screen aloud like every other page.
- After sending: a calm "Check your email, Eleanor" screen with a large "Send it again" button.
- Optional second path: if a caregiver has set a 4-digit PIN for that email, the senior can tap "I have a PIN" and enter four large digits instead. No passwords, no extra fields.

**Staff sign-in (`/staff/auth`)**
- Email and password, plus sign-up for new staff accounts.
- After signing in, staff land on the staff overview.

**After sign-in**
- Role decides the destination: senior → home, staff → staff overview.
- The mode switch in the header only offers Staff Mode to people who actually have the staff role.
- A "Sign out" control appears in accessibility settings (senior) and the staff header.

## What gets protected

- Senior pages (home, Listen, Connect, Explore, Quiet, journey, accessibility) require a signed-in senior.
- The staff overview requires a signed-in staff member and shows only residents assigned to them.
- The demo route stays open with no sign-in, clearly labelled sample data, so judges can still walk through the whole story.

## Personalization

- The senior's saved name, greeting, accessibility settings, preferences, recent choices, and feedback move from the browser into their own account, so they follow them to any device.
- Existing locally saved settings are carried over the first time someone signs in.

## Technical details

Database (one migration, RLS plus grants on every table):
- `profiles` — id referencing the auth user, display name, greeting name, accessibility preferences, preference signals. Self read/write; staff can read profiles of assigned residents.
- `app_role` enum (`senior`, `staff`) and `user_roles` table — roles never live on the profile. A `has_role(user_id, role)` security-definer function backs every policy.
- `resident_assignments` — staff user id plus resident user id, so staff see only their own residents.
- `senior_pins` — bcrypt-style hash of the 4-digit PIN, no plaintext, readable by nobody from the client; only a server function touches it.
- A signup trigger creates the profile row and assigns the default `senior` role.

App:
- Auth state through a `useAuth` hook (session listener plus `getUser` for trusted checks), with a route gate that redirects unauthenticated visitors to the right sign-in page.
- Magic link uses `emailRedirectTo` back to the app origin; email sign-in is enabled on the backend in the same change.
- PIN sign-in runs through a server function that verifies the hash and issues a one-time sign-in link, so the PIN never acts as a password in the browser. Rate-limited per email.
- Staff set or clear a resident's PIN from the staff overview.

## Validation

- Senior magic-link flow end to end, PIN flow, staff email/password flow, wrong-role redirects, sign-out.
- Confirm a senior cannot read another senior's data and staff see only assigned residents.
- Desktop and mobile, large text, high contrast, keyboard use, and spoken prompts on the new sign-in screens.
