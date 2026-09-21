import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/button-audit")({
  head: () => ({
    meta: [
      { title: "Button audit — PACE Staff" },
      { name: "description", content: "Staff reference listing every PACE button and what it does." },
      { property: "og:title", content: "Button audit — PACE Staff" },
      { property: "og:description", content: "Every button in PACE and its working action." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ButtonAudit,
});

type Row = { screen: string; button: string; action: string };

const rows: Row[] = [
  { screen: "Home", button: "Start PACE", action: "Speaks the welcome and reads the page aloud" },
  { screen: "Home", button: "Talk to PACE", action: "Listens and navigates to Listen, Connect, Explore or Quiet" },
  { screen: "Home", button: "Stop", action: "Stops speaking or listening" },
  { screen: "Home", button: "Listen / Connect / Explore / Quiet tiles", action: "Opens that page and logs the choice" },
  { screen: "Every senior page", button: "Back / Home", action: "Navigates back or to the home screen" },
  { screen: "Every senior page", button: "A / A+ / A++", action: "Changes text size and saves it" },
  { screen: "Every senior page", button: "High contrast", action: "Switches the high-contrast theme" },
  { screen: "Every senior page", button: "Help", action: "Creates a help request in the staff queue" },
  { screen: "Listen", button: "Choose / Play / Pause / Next / Stop", action: "Controls the built-in melody player" },
  { screen: "Listen", button: "Volume", action: "Sets playback volume" },
  { screen: "Listen", button: "Songs from when I was 20", action: "Creates a staff request for era music" },
  { screen: "Listen", button: "Heart", action: "Saves or removes a favourite song" },
  { screen: "Connect", button: "Person photo / Call", action: "Creates a staff request to call that person" },
  { screen: "Connect", button: "Write a message", action: "Saves the written message and notifies staff" },
  { screen: "Connect", button: "Record a voice message", action: "Records audio, saves it and notifies staff" },
  { screen: "Connect", button: "Group activity", action: "Creates a staff request to join the group" },
  { screen: "Explore", button: "Paint a postcard", action: "Opens the painting canvas" },
  { screen: "Explore", button: "Try a word puzzle", action: "Opens puzzles and games" },
  { screen: "Explore", button: "Share a favorite story", action: "Opens voice story recording" },
  { screen: "Explore", button: "Gentle movement", action: "Opens the six-step seated stretch guide" },
  { screen: "Explore", button: "Garden / flowers / group", action: "Creates a staff request (needs people or supplies)" },
  { screen: "Explore", button: "My Gallery / My Stories", action: "Opens the resident's saved work" },
  { screen: "Painting", button: "Colors, brushes, eraser, Undo", action: "Draws on the canvas" },
  { screen: "Painting", button: "Clear", action: "Clears the canvas after confirmation" },
  { screen: "Painting", button: "Save", action: "Saves the picture to My Gallery" },
  { screen: "Painting", button: "Show my picture to staff", action: "Shares the picture with staff" },
  { screen: "Painting", button: "Print / Share with family", action: "Prints, or shares if family sharing is on" },
  { screen: "Story", button: "Record / Play / Re-record / Save", action: "Records up to three minutes and saves to My Stories" },
  { screen: "Puzzles", button: "Jigsaw / Pairs / Word game", action: "Plays the chosen game" },
  { screen: "Puzzles", button: "Hint", action: "Reveals one gentle hint" },
  { screen: "Quiet", button: "Breathe with me", action: "Opens guided breathing with spoken cues" },
  { screen: "Quiet", button: "Nature sounds", action: "Opens the rain, waves, wind and birds player" },
  { screen: "Quiet", button: "Rest a while", action: "Opens the dimmed rest screen with a clock" },
  { screen: "Breathing / Rest", button: "2 / 5 / 10 minutes", action: "Sets the session length, ends with a soft chime" },
  { screen: "Any activity", button: "I'm done for now", action: "Logs the activity and returns home" },
  { screen: "Any activity", button: "How was that?", action: "Saves the resident's feedback" },
  { screen: "Staff", button: "In progress / Done", action: "Updates the request status" },
  { screen: "Staff", button: "Save PIN", action: "Sets or clears a resident's sign-in PIN" },
  { screen: "Staff", button: "Save notes", action: "Saves care notes on the resident profile" },
  { screen: "My Settings", button: "Sign out / Delete my information", action: "Ends the session or removes the account data" },
];

function ButtonAudit() {
  return (
    <div className="staff-page">
      <h1>Button audit</h1>
      <p>Every button in PACE, what it does, and confirmation that it has a working action.</p>
      <table className="staff-table">
        <thead>
          <tr>
            <th>Screen</th>
            <th>Button</th>
            <th>What it does</th>
            <th>Handler</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.screen}-${row.button}`}>
              <td>{row.screen}</td>
              <td>{row.button}</td>
              <td>{row.action}</td>
              <td>Working</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
