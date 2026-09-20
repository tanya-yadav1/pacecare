# VitaMove Wellness simplified experience

## Goal
Redesign the everyday experience for an older adult living with Parkinson’s: large choices, plain language, one decision per screen, and no medical claims about music. Preserve the existing clinical and advanced tools behind a secondary “More” area rather than crowding the home screen.

## What will change

### 1. Calm, minimal home
- Replace onboarding and statistics with “Good morning, Tanya,” “What would you like to do?”, and four large actions: Walk with Music, Exercise, Voice & Sing, and Relax.
- Add simple My Music and My Progress links below the four actions.
- Simplify the fixed header to the VitaMove brand, Home, and a clearly labeled More menu for existing screening, clinical, rewards, and community tools.
- Keep the medical disclaimer visible but quieter. Hide stars and Parker from the everyday home and walking flow so they do not compete for attention.

### 2. One-tap walking flow
- Add a dedicated Walk with Music screen with one decision at a time.
- If a saved walking rhythm exists, continue directly to music choices.
- Otherwise offer Use My Usual Rhythm or Help Me Find My Rhythm.
- “Find My Rhythm” runs a clear 30-second assessment, using device motion events where permission and support exist, with a large tap-for-each-step fallback.
- Calculate and save approximate steps per minute locally, with a plain-language explanation and no medical claims.

### 3. My Music
- Add search, favorite songs, artists, genres, and an optional music-service/library choice.
- Use demo catalog metadata only; do not download, stream, or redistribute copyrighted audio.
- Group saved items into Favorite songs, Songs that match my rhythm, and Songs I enjoy most.
- Compare reliable song BPM to the saved cadence using friendly labels such as Great rhythm match and Close rhythm match.
- Add a therapist-configurable target rhythm field with clear wording that no single BPM is right for everyone.

### 4. Supporting everyday screens
- Route Exercise to the existing guided movement experience and Voice & Sing to the existing voice practice.
- Add a simple Relax screen with large breathing and quiet-time controls.
- Add a simplified My Progress screen showing only useful recent activity and saved walking rhythm.

### 5. Accessibility and validation
- Use 18px+ text, large tap targets, high contrast, generous spacing, visible focus states, reduced-motion support, and responsive layouts.
- Add unique page metadata for every new screen.
- Verify desktop and mobile home, rhythm assessment fallback, saved-rhythm shortcut, favorites, rhythm matching, and navigation.

## Technical details
- Store the user’s display name, baseline cadence, optional therapist target, favorites, genres, artists, and service preference in a small React provider persisted in browser storage.
- Use DeviceMotion events only after an explicit user action; automatically expose manual tapping when unsupported or denied.
- Keep the existing TanStack routes and advanced feature pages intact, while reducing their prominence in the primary navigation.
