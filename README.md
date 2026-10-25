# PACE

Create a modern, high-contrast full-stack web application shell optimized for senior accessibility called "VitaMove Parkinson's".

Implement a fixed top navigation header that stays on every page. On the far left, render the "VitaMove Parkinson's" logo. The logo must visually feature: A dynamic blue-and-green abstract athletic figure stretching confidently upward toward a bright golden star, cradled by a blue crescent spine support on the left, and resting on a green base of wellness leaves at the bottom. To the right of the logo, display a global tracking state showing a fire icon for "7-Day Streak" and a gold star icon for "Wellness Stars: 120". At the very top, include a visible text disclaimer: "Disclaimer: VitaMove is a supportive wellness tool. It does not replace professional medical care." Use deep clinical navy blue for structure, pure white for cards, and vibrant amber-yellow for active buttons. Use minimum 18px body text.

Build the Home/Landing page featuring the greeting: “Personalized movement, daily support, and progress tracking for life with Parkinson’s.” Include a prominent yellow "Begin Onboarding" button that opens an interactive Multi-Step Profile Wizard. In the wizard, ask users to select their motor challenges (Tremors, Stiffness, Balance) and exercise preferences (Seated vs. Dance). Include an 'Avatar Initializer' where the user configures a base character companion. Show that premium skins (like a Leopard Skin or Seasonal Outfit) are currently locked, requiring 40 more stars to unlock the first tier. Set up clean page routing to handle dashboard, screening, and rewards pages.
Build the "Clinical Assessment & Screener Hub" page linked from the onboarding wizard.

Part 1: Create a 10-Question Early Risk Screener using a multi-step card layout showing one question at a time with a clear visual progress bar. Questions must cover binary choices for prodromal signs: loss of smell, RBD sleep issues, micrographia, and resting tremors. If the final score triggers a "High Risk" calculation, immediately overlay a non-dismissible compassionate alert modal stating: "Based on clinical markers, we recommend a comprehensive neurological evaluation. Please contact a local specialist." Display a beautifully designed directory of 3 mock local psychiatrists with full professional titles, phone numbers, and interactive "Click to Call" buttons.

Part 2: Build an interactive Kinetic Suite with two selectable tabs. Tab 1 is a "Rest Tremor Frequency Analyzer" with a "Start 15-Second Test" button, a countdown timer, and an animated canvas wave graph simulating unstable hand tremors. When complete, output a red warning badge: "Rest Tremor Frequency Detected: 5.2 Hz (Parkinsonian Range)". Tab 2 is a "10-Second Alternating Finger-Tapping Game" featuring two massive 'Left Tap' and 'Right Tap' buttons that count user inputs live and display a "Manual Dexterity Score" based on calculated millisecond tap-cadence variance.

Create the central "Personalized Patient Dashboard" view featuring the companion avatar setup during onboarding.

Directly below, implement the "What Hurts Most Today?" triage hub with clickable toggle chips for "Stiff Joints", "Tremors", and "Low Energy". Clicking a chip must dynamically filter and highlight a matching recommended physical task in the checklist below. Build the main "Today's Plan" task checklist containing: Daily Symptom Log, Targeted Movement Therapy, Medication Checklist, and Cognitive Arcade Game.

CRUCIAL PRESENTATION FLOW: Program a "Demo Trigger" tied to checking off the 'Targeted Movement Therapy' task card. When checked by the user:

Instantly award exactly +40 Wellness Stars, updating the global header counter from 120 to 160.

Trigger a beautiful, celebratory overlay notification banner across the screen that reads: "🎉 Milestone Reached! +40 Stars Earned. NEW AVATAR SKIN UNLOCKED!"

Make the floating chatbot widget, Parker (who is styled to look exactly like the blue-and-green figure from the logo), pop open automatically from the bottom-right corner and send a custom text bubble: "Sensational work on today's movement session! You just earned 40 stars and unlocked a new skin in the Wellness Store! Go check it out! 🌟"

Ensure this floating chatbot widget is anchored at the bottom-right corner of all pages, displaying the circular branding logo. When opened manually, it greets the user with "hi I'm Parker" and can answer preset questions about navigation and tremors.

Build a separate "Wellness Rewards Store" page view. Display the user's active balance (updating dynamically to 160 stars after the demo trigger). Show a preview panel of the avatar. In the skins storefront grid, show that the "Leopard Skin" and "Seasonal Holiday" outfits have changed from 'Locked' to 'UNLOCKED!'. Clicking the high-contrast "Equip Skin" button must instantly apply that leopard or seasonal pattern directly onto the avatar character preview panel. Parker looks like the attached avatar in the image. Please also change the logo accordingly.

Modify the "Targeted Movement Therapy" card link behavior from the Dashboard (referenced in Screenshot 2026-07-01 at 2.05.29 am.jpg) to open a dedicated split-screen "AI Movement & Dance Therapy Hub" page.

EXERCISE SELECTION COLUMN (Left Side):

Create a list of 3 interactive exercise cards that users can toggle between:

"Seated Hand Mobility" (Target: Hand Dexterity)

"LSVT BIG Reaching" (Target: Overriding Rigidity)

"Fluid Rhythm Step" (Target: Gait & Freezing Control)

LIVE AI MIRROR COLUMN (Right Side):

When an exercise is selected, dynamically load an instructional video placeholder on top, and activate a live webcam feed box beneath it using the HTML5 mediaDevices API.

Overlay a bright, glowing green SVG skeleton wireframe (a circular head node, connected lines for shoulders, elbows, wrists, spine, and hips) directly on top of the live video stream to simulate a green dummy body-tracker.

DYNAMIC LIVE FEEDBACK TICKER:

Create a high-contrast panel next to the camera labeled "Live AI Form Analysis". When the camera is active, program the text to update dynamically based on which exercise is currently selected:

If "Seated Hand Mobility" is active, cycle the text loop: "Detecting finger joints..." -> "Tap frequency steady" -> "ALERT: Extension dropping. Lift the hand higher and open fingers wide!" -> "Correction applied: Amplitude target reached (+10 Stars)."

If "LSVT BIG Reaching" is active, cycle the text loop: "Calibrating maximum extension..." -> "Exercise started: Reach out fully" -> "ALERT: Rigidity detected in left elbow at 72 degrees. Stretch higher!" -> "Form corrected: Joint angle optimized (+10 Stars)."

If "Fluid Rhythm Step" is active, cycle the text loop: "Tracking lower hip alignment..." -> "Follow the beat: Step wide" -> "ALERT: Freezing indicator flagged. Take a slightly larger stride!" -> "Step completed safely with rhythmic pacing (+10 Stars)."

THE PITCH CLIMAX TRIGGER:

Include a prominent yellow "Finish Session & Claim Rewards" button at the bottom of the page. Clicking it must fire the presentation demo sequence: increment the global counter by +40 Wellness Stars (bringing it to 320), launch the celebratory overlay notification banner reading "🎉 Milestone Reached! +40 Stars Earned. NEW AVATAR SKIN UNLOCKED!", and make Parker automatically expand with his custom congratulatory bubble.

Add two separate, dedicated page views called "Clinician Portal" and "Community Hub" and make them accessible via two new high-contrast tabs labeled "Clinician View" and "Community" in the fixed top navigation header layout.

"CLINICIAN PORTAL" PAGE VIEW:

Structure: Design the page to look like a premium Electronic Medical Record (EMR) system using a sleek, professional healthcare layout. At the top, display a patient profile selector summary card reading: "Patient Reference Profile: ID #4402 | Current Diagnostic Status: Hoehn & Yahr Stage II | Treatment Window Optimization Active".

Data Analytics Charts: Generate three beautiful graphical data tracking charts plotted over a fictional 30-day timeline to show the data gathered by the app:

Chart 1 (Line Graph): "Resting Tremor Magnitude Trend" showing a steady downward slope in frequency (Hz) over weeks of movement therapy compliance.

Chart 2 (Calendar-Style Heat Map): "Daily Exercise & Medication Adherence Matrix" with color-coded squares representing routine consistency.

Chart 3 (Dual-Axis Scatter Plot): "Fine Motor Dexterity Analysis" mapping user finger-tapping "Flight-Time Variance" (ms) against daily self-reported rigidity logs.

Actions: Add a high-contrast action button labeled "Export Clinical Report to Secure EMR" and an administrative alert log displaying: "Alert Triggered: 10-Question Risk Screener flagged high-risk prodromal signs. Automated recommendation sent for local psychiatric consultation."

"COMMUNITY HUB" PAGE VIEW:

Structure: Create a clean, high-contrast, age-friendly layout split into two selectable sub-tabs: "Daily Challenge Leaderboard" and "Community Circles".

Sub-Tab 1 (Daily Challenge Leaderboard): Display a weekly ranking grid of 4 mock Parkinson's patients tracking their daily routine streaks. Each row must show a circular Patient Avatar Preview (showcasing custom skins like the Leopard Skin or Holiday Outfit), a Username (e.g., "Arthur_Stride7", "Elena_BIGMove"), Active Streak Days, and Total Weekly Wellness Stars. Next to each row, include a large yellow button labeled "Send Encouragement". When clicked, trigger a top notification banner reading: "🎉 Support Sent! You encouraged Arthur_Stride7 and earned +5 Wellness Stars for fostering community!" and add +5 to the global star counter.

Sub-Tab 2 (Community Circles): Create a senior-friendly message board feed pre-populated with realistic mock posts (e.g., "Elena_BIGMove posted: The LSVT BIG reaching exercise really helped open up my posture this morning!"). Implement a functional text input field with a "Post to Circle" button. Clicking post must instantly append the typed message to the top of the feed with a smooth animation using the user's active profile avatar.

Ensure the fixed universal top header layout, global star tracking states, and the floating 'Parker' chatbot widget remain fully operational across both new pages.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pacecare.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/636a022e-314c-478d-9f17-a7bb29b801dc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
