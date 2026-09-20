# VitaMove focused wellness experience

## Goal
Make VitaMove feel like one friendly app that helps a person understand movement, stay active, and prepare useful information for a healthcare professional—without diagnosing, prescribing, or presenting app observations as medical examinations.

## Experience structure

### 1. Clear identity and navigation
- Restore the **VitaMove** name with “Understand your movement. Move with confidence.”
- Replace the current home actions with four large choices: **Check My Symptoms**, **Move & Exercise**, **Mind & Body**, and **My Progress**.
- Add a prominent **Prepare for My Doctor Visit** action, a simple **My Day** entry, and a persistent **Need Help?** button.
- Keep advanced existing pages available in a quiet secondary menu rather than on the everyday home screen. Music will only appear as an optional activity tool.

### 2. Guided symptom checks
- Reuse the existing tapping, spiral, walking, voice, and balance-capable patterns inside a calmer assessment center covering the requested symptom categories.
- Present one short check at a time with: what it is, simple instructions, Start, Skip, Save Assessment, and Share with My Doctor.
- Request microphone, motion, or camera access only after the user chooses a related check.
- Save dated user responses and measurements as **App-based observations** in browser storage, with the non-diagnostic summary: “Your responses show movement changes that may be worth discussing with a healthcare professional.”
- Remove diagnostic labels, disease-range conclusions, and language implying equivalence to a neurological examination.

### 3. Move & Exercise
- Add the goal selector for Walking, Balance, Strength, Posture, Flexibility, Daily Movement, Hand Coordination, and Voice.
- Let the user choose 5, 10, 20, or 30 minutes, then immediately show a short session such as warm-up, practice, balance, and cool-down.
- Reuse the existing movement demonstrations and voice/hand activities where appropriate.
- Follow the same four-step activity pattern: **What is this? Why might I do it? Start/Complete. How did it feel?**
- Offer rhythm and music only through optional actions such as **Add Rhythm** or **Play Music**, with advanced tempo controls behind **Personalize Rhythm**.

### 4. Mind & Body and My Day
- Create simple Yoga, Tai Chi, Dance, Stretching, Breathing, Meditation, Relaxation, and Music choices.
- Include plain-language purpose, Beginner/Seated/Gentle or other relevant ability choices, and brief safety guidance without medical promises.
- Build **My Day** as a small “Your wellness plan” list based on saved goals, favorite activities, available time, recent sessions, and reported difficulty. It will suggest wellness activities, not medical treatment.

### 5. Progress and doctor preparation
- Expand My Progress to show dated app observations, reported symptoms, sessions, minutes, walking, yoga, voice, and balance practice in simple lists rather than a clinical dashboard.
- Record completion and “How did it feel?” feedback for activities.
- Build a concise doctor-visit report containing selected assessment history, observations, user-entered questions, optional medications, and activity history.
- Support printing and the device share sheet where available, and always display: “This report is intended to help you communicate with your healthcare professional. It is not a medical diagnosis.”

### 6. Information and safety
- Add Treatment Information pages for Medication, Physical Therapy, Occupational Therapy, Speech Therapy, Exercise, Surgical Options, Lifestyle & Wellness, and Clinical Trials.
- Keep content high-level; never provide doses or tell someone to start, stop, or change medication.
- Add urgent guidance for falls, severe dizziness, chest pain, severe shortness of breath, or sudden severe neurological symptoms, directing the user to appropriate medical or emergency help instead of an exercise.

## Technical details
- Extend the existing wellness provider with versioned browser persistence for preferences, available time, activity history, symptom reports, assessment history, questions, and optional medication entries.
- Preserve existing working routes and interactive tools; wrap or relabel them for the new simpler flows instead of rewriting their mechanics.
- Add focused routes for `/symptoms`, `/move`, `/mind-body`, `/my-day`, `/doctor-visit`, and `/treatment-info`, each with unique metadata.
- Replace unsafe non-null assertions in any touched assessment code and use existing semantic tokens and Button components.
- Validate desktop and mobile navigation, permission prompts, skip paths, assessment saving, session completion, persistence, report printing/sharing, keyboard focus, screen-reader labels, and reduced motion.
