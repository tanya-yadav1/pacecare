import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { usePaceAuth } from "@/lib/pace-auth";
import { signInWithPin } from "@/lib/pace-pin.functions";
import { speakInstructions } from "@/lib/speech";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — PACE" },
      {
        name: "description",
        content: "Sign in to PACE with one email link, or with the 4-digit PIN a caregiver set up.",
      },
      { property: "og:title", content: "Sign in to PACE" },
      { property: "og:description", content: "Your voice. Your choice. Your moment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SeniorSignIn,
});

function SeniorSignIn() {
  const navigate = useNavigate();
  const { session, role, loading } = usePaceAuth();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [usePin, setUsePin] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (loading || !session) return;
    void navigate({ to: role === "staff" ? "/staff" : "/", replace: true });
  }, [loading, session, role, navigate]);

  const sendLink = async () => {
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) {
      setMessage("PACE could not send the link. Please check the email address.");
      return;
    }
    setSent(true);
    void speakInstructions("Check your email. PACE sent you a sign in link.").catch(() => {});
  };

  const submitPin = async () => {
    setBusy(true);
    setMessage("");
    const result = await signInWithPin({ data: { email: email.trim(), pin } });
    if (!result.ok) {
      setBusy(false);
      setMessage(result.message);
      return;
    }
    const { error } = await supabase.auth.verifyOtp({
      type: "email",
      token_hash: result.tokenHash,
    });
    setBusy(false);
    if (error) {
      setMessage("PACE could not sign you in just now. Please try again.");
      return;
    }
    void navigate({ to: "/", replace: true });
  };

  if (sent) {
    return (
      <div className="simple-page">
        <h1>Check your email</h1>
        <p className="simple-lead">
          PACE sent a sign-in link to {email}. Open the email and tap the big link.
        </p>
        <Button size="xl" onClick={() => void sendLink()} disabled={busy}>
          Send it again
        </Button>
        <Button size="xl" variant="outline" onClick={() => setSent(false)}>
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <div className="simple-page">
      <p className="eyebrow">PACE</p>
      <h1>Welcome back</h1>
      <p className="simple-lead">Your voice. Your choice. Your moment.</p>

      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (usePin) void submitPin();
          else void sendLink();
        }}
      >
        <label htmlFor="pace-email">Your email</label>
        <input
          id="pace-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="eleanor@example.com"
        />

        {usePin && (
          <>
            <label htmlFor="pace-pin">Your 4-digit PIN</label>
            <input
              id="pace-pin"
              inputMode="numeric"
              maxLength={4}
              required
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="1234"
            />
          </>
        )}

        <Button size="xl" type="submit" disabled={busy || !email.trim()}>
          {usePin ? <KeyRound /> : <Mail />}
          {usePin ? "Sign in" : "Send my sign-in link"}
        </Button>
      </form>

      {message && (
        <p className="pace-reply" role="status">
          {message}
        </p>
      )}

      <Button
        size="xl"
        variant="outline"
        onClick={() => {
          setUsePin(!usePin);
          setMessage("");
        }}
      >
        {usePin ? "Email me a link instead" : "I have a PIN"}
      </Button>

      <p className="simple-note">
        <strong>Your privacy:</strong> PACE saves only your name, what you choose, and how you say it
        felt. Nothing is sold or shared outside your care team, and you can delete everything at any
        time from My Settings.
      </p>

      <p className="simple-note">
        Are you a caregiver or staff member? <a href="/staff-signin">Staff sign in</a>
      </p>
    </div>
  );
}
