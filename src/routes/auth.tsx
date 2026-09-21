import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import paceLogo from "@/assets/pace-logo.png";
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

  const submitPin = async (pinOverride?: string) => {
    setBusy(true);
    setMessage("");
    const result = await signInWithPin({ data: { email: email.trim(), pin: pinOverride ?? pin } });
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
      <div className="simple-page auth-page">
        <header className="welcome-masthead">
          <img src={paceLogo} alt="PACE" className="welcome-logo" />
          <div className="welcome-brand-text">
            <h1 className="welcome-brand-title">PACE</h1>
            <p className="welcome-brand-subtitle">Personalized Aging & Connection Experience</p>
          </div>
        </header>
        <h2 className="auth-title welcome-page-title">Check your email</h2>
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
    <div className="welcome-page">
      <header className="welcome-masthead">
        <img src={paceLogo} alt="PACE" className="welcome-logo" />
        <h1 className="auth-title">Welcome to PACE</h1>
        <div className="welcome-spacer" aria-hidden="true" />
      </header>
      <p className="welcome-tagline">Your voice. Your choice. Your moment.</p>

      <main className="welcome-content">
        <section className="welcome-demo" aria-labelledby="demo-heading">
          <h2 id="demo-heading">Experience PACE as Eleanor</h2>
          <p>Enter the fictional senior experience with one tap. No account details needed.</p>
          <Button className="welcome-demo-button" size="xl" disabled={busy} onClick={() => void submitPin("1234")}>
            <UserRound />
            Start senior demo
            <ArrowRight />
          </Button>
        </section>

        <div className="welcome-divider"><span>Or sign in to your account</span></div>

      <form
        className="auth-form welcome-signin"
        onSubmit={(event) => {
          event.preventDefault();
          if (usePin) void submitPin();
          else void sendLink();
        }}
      >
        <label htmlFor="pace-email">Your email{usePin ? " (not needed for the demo PIN)" : ""}</label>
        <input
          id="pace-email"
          type="email"
          autoComplete="email"
          required={!usePin}
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

        <Button size="xl" type="submit" disabled={busy || (usePin ? pin.length !== 4 : !email.trim())}>
          {usePin ? <KeyRound /> : <Mail />}
          {usePin ? "Sign in" : "Send my sign-in link"}
        </Button>
      </form>

      {usePin && (
        <p className="welcome-help">
          Your caregiver can give you a 4-digit PIN. The demo PIN is <strong>1234</strong>.
        </p>
      )}

      {message && (
        <p className="pace-reply" role="status">
          {message}
        </p>
      )}

      <Button
        className="welcome-switch"
        size="xl"
        variant="outline"
        onClick={() => {
          setUsePin(!usePin);
          setMessage("");
        }}
      >
        {usePin ? "Email me a link instead" : "I have a PIN"}
      </Button>

        <Button className="welcome-staff" size="xl" asChild>
          <Link to="/staff-signin">
            <span>
              <strong>Staff sign in</strong>
              <small>Caregivers and team members</small>
            </span>
            <ShieldCheck />
          </Link>
        </Button>

        <p className="welcome-privacy">
          <ShieldCheck aria-hidden />
          <span><strong>Your privacy matters.</strong> PACE saves only what is needed to support your choices. Your information is never sold.</span>
        </p>
      </main>
    </div>
  );
}
