# PACE Senior Connection Experience

## Goal
Transform the existing app—without rebuilding its foundations—into **PACE: Personalized Aging & Connection Experience**, a warm, non-medical platform where older adults express what matters and trusted people help create a better next moment.

Core loop:

```text
VOICE → CHOICE → EXPERIENCE → FEEDBACK → DISCOVERY → CONNECTION → BETTER NEXT MOMENT
```

For the Congressional App Challenge, Caregiver / Staff Mode will be a polished, clearly labeled sample-data experience with no sign-in barrier. This keeps the complete story immediately testable while demonstrating how authorized care workflows would work.

## What will change

### 1. New identity and product language
- Replace the Parkinson’s-specific name, subtitle, metadata, disclaimers, and visible language across the app.
- Create a new warm PACE logo and matching compact app icon representing voice, choice, and human connection.
- Use the wordmark: **PACE / Personalized Aging & Connection Experience**.
- Remove diagnostic, treatment, symptom-testing, medication-management, and disease-progression framing from the primary experience.
- Keep a clear statement that PACE does not diagnose, cure, or treat medical or mental-health conditions.

### 2. Two clear entry experiences
- Add a simple mode welcome and persistent mode switch for **Senior Mode** and **Caregiver / Staff Mode**.
- Keep Senior Mode intentionally minimal; give Staff Mode richer planning and insight tools.
- Make both modes easy to return home from and preserve accessibility preferences.

### 3. Senior Mode
- Build the home around one question: **“What would you like right now?”**
- Show only four enormous choices: **Listen, Connect, Explore, Quiet**.
- Add a prominent **Talk to PACE** control.
- Use “Good morning, Eleanor ❤️” and calm cream, sage, soft blue, and warm peach surfaces.
- Each choice opens a focused experience with one next decision, a clear back/home control, and large touch targets.
- Reuse and reframe working music, relaxation, activity, notes, trusted-circle, and accessibility features.

### 4. Voice-first interaction
- Add browser-supported speech recognition with a typed fallback.
- Interpret simple natural language such as wanting music, calling a daughter, seeing other people, resting, or trying something new.
- Confirm what PACE heard before moving into the selected experience.
- Reuse the working spoken-audio service for warm PACE replies when voice instructions are enabled.
- Show a clear fallback when speech recognition or playback is unavailable.

### 5. Choice, feedback, and discovery
- Record simple preferences and recent choices locally in the existing saved profile.
- After an experience, ask one easy feedback question such as **“How was that?”**
- Use feedback to surface a gentle next suggestion without deciding for the senior.
- Reframe the journey page as personal moments, enjoyed activities, connections, and discoveries.

### 6. Caregiver / Staff Mode
- Build a competition-ready sample dashboard with clearly labeled sample residents.
- Show resident preferences, recent choices, connection patterns, activity ideas, planned moments, and handoff notes.
- Include group-planning suggestions based on shared interests and availability.
- Keep insights descriptive and human-centered—not medical scores or diagnoses.
- Make sharing and family/caregiver visibility explicit and resident-controlled in the demonstrated flow.

### 7. Navigation and legacy cleanup
- Replace the current clinical/wellness navigation with mode-specific navigation.
- Preserve working low-level capabilities where they fit, but remove obsolete Parkinson’s routes from visible navigation.
- Keep existing published paths from breaking by converting legacy pages into safe redirects or non-medical equivalents where practical.
- Update every active page with unique PACE metadata and consistent branding.

## Technical details
- Extend the existing local saved-state provider instead of creating a parallel data system.
- Add role/mode, preference signals, connection moments, experience feedback, and staff handoff records.
- Implement speech recognition as a browser capability with graceful feature detection; keep text input available.
- Reuse the existing server-side text-to-speech endpoint and accessibility settings.
- Use semantic design tokens for the new cream/sage/blue/peach system and preserve reduced-motion and high-contrast behavior.
- Use clearly labeled sample data for the challenge demo; no real resident data or unsecured medical information.

## Validation
- Verify the full senior journey: home → voice or tap choice → experience → feedback → next suggestion.
- Verify the staff journey: resident overview → planning → handoff → group opportunity.
- Test desktop and mobile layouts, large and extra-large text, high contrast, keyboard navigation, screen-reader labels, and voice fallback behavior.
- Confirm there is no visible claim that PACE diagnoses, treats, cures, or prevents any condition.
