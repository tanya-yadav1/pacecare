PACE: Personalized Aging & Connection Experience

Live demo: https://pacecare.lovable.app

PACE is a web app that helps seniors, especially those living with memory loss, spend each day around what they genuinely enjoy, and helps the caregivers who support them understand each person better.

Built for the Congressional App Challenge.

Why I built this

I have volunteered at a senior center since my freshman year, feeding residents, running activities, and helping with day to day care for people living with Alzheimer's. The hardest part was never the tasks. It was knowing what each person actually liked, what calmed them, and what made them happy.

That knowledge lived in whoever happened to be paying attention that day, and it was easy to lose between shifts. Medicine manages a lot in memory care, but it cannot tell a caregiver that someone loves a certain song, or needs a quiet morning. PACE is built to capture those small, human details so any caregiver can act on them, and so a resident's day is shaped by what brings them joy.

PACE does not diagnose, treat, or cure any condition. It is designed to support quality of life, connection, and personal choice.

Try it in 30 seconds
Open https://pacecare.lovable.app/auth
Tap Start senior demo. No account or personal details are needed.
Explore Resident Mode, then switch to Staff Mode to see how feedback reaches caregivers.
Features
Resident Mode
Feature	What it does
Listen	Browse music categories, pick familiar songs, choose your preferences, let PACE surprise you with something new, or sing along.
Connect	Stay socially engaged by reaching friends, family, and other residents. With a real account, the details a resident shares about themselves during setup personalize who appears here.
Explore	Interactive activities including puzzles, games, and gentle exercise to stay mentally and physically engaged.
Your Voice Matters	Available in every feature. After an activity, residents share quick feedback about what they did.
My Moments	Every piece of feedback is saved here, building the resident's profile over time and personalizing the app.
Spoken guidance

PACE can read instructions aloud, so residents do not have to rely on reading small text. It streams a generated voice from a server route, can use the device's built in voice for an instant response to a tap, and handles browsers that block sound until the first tap. When running locally, the AI generated voice needs a LOVABLE_API_KEY (see Environment variables). The live demo has it configured.

Staff Mode
Feature	What it does
Resident overview	See each resident's interests, preferences, and needs in one place.
Feedback review	Read the "Your Voice Matters" responses to learn what residents enjoy, what they prefer, and where something could be improved.
Senior preview	Step into the exact resident experience to see what each resident sees.

The goal is a direct line between a resident expressing themselves and a caregiver acting on it.

Accounts
Senior demo: one tap, no sign in, uses fictional data.
Resident sign in: magic link by email, or PIN.
Staff sign in: separate staff login.
During account setup, residents can share a little about themselves, which PACE uses to personalize Connect.
Tech stack
Layer	Technology
Language	TypeScript
Framework	TanStack Start (React 19, TanStack Router, TanStack Query), built with Vite
UI	Tailwind CSS v4, Radix UI components, Lucide icons
Forms and validation	React Hook Form, Zod
Backend and database	Supabase (PostgreSQL and Auth)
Voice	Browser speech synthesis, plus AI generated speech through the Lovable AI Gateway (Google Gemini text to speech)
Platform	Web (desktop, tablet, and mobile browsers)
Hosting	Lovable
Run it locally
Prerequisites
Node.js 20.19 or newer (the current LTS release is recommended)
npm (included with Node.js)
Steps
bash
# 1. Clone the repository
git clone https://github.com/tanya-yadav1/pacecare.git
cd pacecare

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

Open the local address printed in your terminal.

Environment variables

PACE connects to a Supabase backend. The repository includes a .env file with the public settings for the PACE backend, so you can run the project without extra setup. To connect your own Supabase project instead, copy .env.example to .env and replace the values with ones from your Supabase dashboard (Project Settings, then API):

bash
cp .env.example .env
Variable	Used by	What it is
VITE_SUPABASE_URL	Browser	Your Supabase project URL
VITE_SUPABASE_PUBLISHABLE_KEY	Browser	Your Supabase publishable (public) key
VITE_SUPABASE_PROJECT_ID	Browser	Your Supabase project ID
SUPABASE_URL	Server	Same project URL
SUPABASE_PUBLISHABLE_KEY	Server	Same publishable key
SUPABASE_PROJECT_ID	Server	Same project ID
LOVABLE_API_KEY	Server (optional)	Key for the AI generated voice. It is provided automatically when the app is hosted on Lovable. Without it, AI generated speech is unavailable.

The publishable key is designed to be used in the browser, and access to data is controlled by the database's own rules. Never put a Supabase service role key in the frontend or commit it to this repository. LOVABLE_API_KEY is also a secret: it stays on the server and must never be committed.

Other commands
bash
npm run build      # create a production build
npm run build:dev  # build in development mode
npm run preview    # preview the production build locally
npm run lint       # check code quality with ESLint
npm run format     # format the code with Prettier
Accessibility and design choices

PACE is designed around how people with memory loss and age related changes actually use technology:

Large text and large, easy to tap buttons
Instructions that can be read aloud
One clear action at a time, instead of dense menus
Familiar things (music, people) instead of open ended questions
Calm, uncluttered screens with warm, high contrast colors
No pressure: nothing is timed, scored, or urgent
Privacy
The senior demo uses fictional data only.
Residents and staff have separate modes, and staff tools are kept out of the resident experience.
Account information is only used to personalize the experience. It is not sold.
When PACE reads text aloud with its generated voice, that text is sent to an AI speech service (through the Lovable AI Gateway) to create the audio.
If you try PACE with real people, please get permission from the facility and the residents or their families first.
Project status

PACE is a working prototype. The next step is a pilot with residents and staff at the senior center where I volunteer, to test it with the people it was built for and improve it from their feedback.

Planned improvements:

Pilot testing and feedback from residents and staff
More music, activities, and exercise options
Richer insights for staff from resident feedback
AI disclosure

PACE was built with the help of AI tools: Lovable (an AI app builder) and Claude by Anthropic. The idea, the features, and the design decisions come from my own volunteering experience with seniors. AI tools helped generate and refine code, and I reviewed and tested the result. A full disclosure is included in my Congressional App Challenge submission.

License

Released under the MIT License.

Author

Built by @tanya-yadav1.
