# PACE Senior-First Companion

## Goal
Transform the existing app around one clear journey:

```text
CHECK → PERSONALIZE → PRACTICE → TRACK → PREPARE
```

Preserve the working movement checks, guided activities, voice instructions, music preferences, saved history, urgent-help guidance, and doctor-report sharing. Reframe or simplify older specialist tools instead of rebuilding the app.

## Experience

### 1. Calm home and navigation
- Replace the current home with “Good morning, Tanya,” the question “What would you like to do today?”, and four large choices: Check, Move, Wellness, and Care.
- Add a compact “Today’s PACE” preview with Walking, Gentle Yoga, and Balance plus one “Start Today” action.
- Simplify the main navigation to Home, PACE Check, My PACE, My Journey, and My Care. Keep existing advanced tools reachable from a secondary menu so working functionality is preserved.
- Update brand messaging to “Parkinson’s Adaptive Care & Exercise” and “Understand. Practice. Prepare.”

### 2. PACE Check and personalization
- Rework the current symptom flow into five short categories: Walking, Hands, Voice, Mobility, and How I Feel.
- Reuse existing walking, tapping, spiral, and voice tools only as optional app-based observations with explicit permission where sensors, camera, or microphone are used.
- Save dated check results and compare only against a previous result when enough data exists, using neutral language.
- Finish with “Your PACE Snapshot” and an “Add to Doctor Report” action.
- Add a multi-select “What matters most to you?” screen for Walking, Balance, Strength, Flexibility, Posture, Hands, Voice, Independence, and Relaxation.

### 3. My PACE, Move, Wellness, and Music
- Turn My Day into “My PACE,” showing an editable/skippable wellness plan based on selected goals, preferred activities, available time, and previous difficulty.
- Keep activity completion and “How did it feel?” recording.
- Organize Move into Walking, Balance, Strength, Flexibility, Posture, Coordination, and Mobility with WHAT / WHY / START, 5/10/20/30-minute choices, and safe alternatives.
- Keep Wellness focused on Yoga, Tai Chi, Dance, Stretching, Breathing, Meditation, Relaxation, and Music, including seated and gentle choices.
- Simplify music to Choose / Play / Pause / Stop. Keep cadence and rhythm controls inside a collapsed Advanced section. Add “Add Music” only within relevant activities.

### 4. PACE Guide, My Journey, and My Care
- Replace the old helper wording with “PACE Guide,” limited to navigating saved PACE information, summarizing user-entered notes, and suggesting app activities.
- For concerns such as turning difficulty, offer only Add to Report, Practice, or Not Now. Include a clear non-diagnostic boundary.
- Turn My Progress into “My Journey,” a warm timeline of movement, yoga, walking, balance, voice practice, and short personal notes.
- Add “My Care” with Goals, user-entered Medications, Care Team, PACE Circle, and Doctor Report.
- Reframe the existing community area as user-controlled PACE Circle sharing choices for family, caregiver, doctor, physical therapist, occupational therapist, and speech therapist.

### 5. My PACE Report
- Upgrade the current printable/shareable report with assessment history, app-based movement observations, reported symptoms, activity categories, personal notes, and clinician questions.
- Let the user decide which saved items are included.
- Display: “This report contains user-reported information and app-generated observations. It is not a medical diagnosis.”
- Keep medication content user-entered and educational, never recommending dosage or medication changes.

### 6. Senior Mode and visual system
- Add remembered Accessibility Settings for Standard, Large, and Extra Large text; High Contrast; Voice Instructions; Reduced Motion; and Screen Reader Support.
- Use at least 48px touch targets, strong focus states, plain language, short screens, high contrast, and no dense dashboard layouts.
- Refresh the visual system with deep navy, teal, soft white, and warm gold semantic tokens while keeping the existing human-in-motion PACE mark.
- Ensure all motion respects both the saved Reduced Motion setting and the device preference.

### 7. Competition demo
- Add a hidden `/pace-demo` route with clearly labeled sample data and a guided 60–90 second sequence: PACE message → PACE Check → sample observation → goals → My PACE → optional music → My Journey → My PACE Report → closing brand statement.
- Keep demo state separate from the user’s saved information.

## Technical details
- Extend the existing saved wellness provider rather than introducing a second data system. Add accessibility preferences, personal notes, care-team members, sharing selections, plan items, and report inclusion flags with safe migration defaults.
- Reuse `ActivityGuide`, existing check routes, music preferences, audio instructions, local persistence, printing, and sharing.
- Add only the route files required for shareable screens: `/care`, `/accessibility`, and `/pace-demo`; keep `/my-day`, `/progress`, `/doctor-visit`, `/move`, `/mind-body`, and `/symptoms` as stable public URLs with updated page identities.
- Give every new or changed page unique PACE metadata.

## Verification
- Test the core journey on desktop and mobile: home → check → goals → activity → feeling → journey → report.
- Verify saved preferences and history survive reloads, optional device permissions are explicit, report printing works, and demo data never enters personal history.
- Check keyboard navigation, labels, focus, 48px targets, text scaling, high contrast, reduced motion, no overflow, and no console errors.
- Confirm no screen uses diagnostic, cure, prevention, progression, or medication-change claims.
