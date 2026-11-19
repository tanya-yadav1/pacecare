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
Language	TypeScript / JavaScript
Frontend	React, Vite
Styling	Tailwind CSS, shadcn/ui
Backend and database	Supabase (PostgreSQL and Auth) through Lovable Cloud
Platform	Web (desktop, tablet, and mobile browsers)
Hosting	Lovable
Run it locally
Prerequisites
Node.js 18 or newer
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

Open the local address printed in your terminal (usually http://localhost:8080 or http://localhost:5173).

Environment variables

PACE connects to a Supabase backend. If your clone does not already include a .env file, create one in the project root:

bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-public-anon-key

Only use the public (anon) key in the frontend. Never commit a service role key.

Other commands
bash
npm run build     # create a production build
npm run preview   # preview the production build locally
npm run lint      # check code quality
Accessibility and design choices

PACE is designed around how people with memory loss and age related changes actually use technology:

Large text and large, easy to tap buttons
One clear action at a time, instead of dense menus
Familiar things (music, people) instead of open ended questions
Calm, uncluttered screens with warm, high contrast colors
No pressure: nothing is timed, scored, or urgent
Privacy
The senior demo uses fictional data only.
Residents and staff have separate modes, and staff tools are kept out of the resident experience.
Account information is only used to personalize the experience. It is not sold.
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
