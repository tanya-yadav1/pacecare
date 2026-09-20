# VitaMove Parkinson's application plan

## Experience foundation
- Build an age-friendly, high-contrast design system with minimum 18px body text, clinical navy structure, white surfaces, amber actions, generous spacing, clear focus states, and reduced-motion support.
- Use the supplied VitaMove/Parker artwork for the shared brand mark, companion avatar, community avatars, and rewards preview.
- Add a fixed universal header with disclaimer, navigation, streak, live star balance, and a persistent Parker chat widget.
- Keep star changes shared across every page. Follow strict arithmetic: 120→160 for the dashboard movement task, then 160→200 after finishing therapy; community encouragement adds 5 each time.

## Pages and routing
- Home: greeting, onboarding call-to-action, and interactive multi-step profile wizard for motor challenges, exercise preference, avatar setup, and locked premium skins.
- Dashboard: companion summary, “What Hurts Most Today?” filters, tailored recommendation highlighting, and Today’s Plan checklist with the required +40 milestone sequence.
- Assessment: 10-question one-at-a-time risk screener, progress, compassionate non-dismissible high-risk result, specialist directory, tremor analyzer, and alternating finger-tapping game.
- Movement Therapy: selectable exercise list, instructional media area, permission-based live camera, SVG body-tracking overlay, exercise-specific rotating feedback, and +40 session completion sequence.
- Rewards: live balance, avatar preview, skin unlock status, and instantly equipable leopard or holiday treatments.
- Clinician View: patient summary, 30-day tremor line chart, adherence heat map, dexterity/rigidity scatter chart, export action, and alert log.
- Community: leaderboard with encouragement rewards and a message board where new posts appear immediately.

## Shared interactions
- Create a single app state provider for stars, onboarding selections, avatar skin, milestone banners, task completion, and Parker’s messages.
- Parker opens automatically for milestone events, opens manually with “hi I'm Parker,” and answers preset navigation and tremor questions.
- Prevent duplicate rewards from repeated completion clicks while keeping all visible demos immediately usable.
- Request camera access only after the user starts it; show a useful simulated tracking state if permission is unavailable.

## Persistence and validation
- Persist profile, star balance, avatar skin, and completed milestones in Lovable Cloud with safe access controls; keep the public demo usable before sign-in through local session state.
- Add unique metadata for every page.
- Validate desktop and mobile layouts, route navigation, onboarding, scoring, timers, tapping, rewards, community posting, camera fallback, and celebratory sequences in the live preview.
