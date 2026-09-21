import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BriefcaseBusiness, MonitorPlay, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import paceLogo from "@/assets/pace-logo.png";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { usePaceAuth } from "@/lib/pace-auth";
import { confirmStaffPin, signInAsDemoStaff } from "@/lib/pace-pin.functions";

export const Route = createFileRoute("/staff-signin")({
  head: () => ({
    meta: [
      { title: "Staff sign in — PACE" },
      {
        name: "description",
        content:
          "Caregivers and staff sign in to plan meaningful moments with the residents they support.",
      },
      { property: "og:title", content: "Staff sign in — PACE" },
      { property: "og:description", content: "Plan better moments with the people you care for." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StaffSignIn,
});

function StaffSignIn() {
  const navigate = useNavigate();
  const { session, role, loading, refresh } = usePaceAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [stage, setStage] = useState<"credentials" | "pin">("credentials");
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (loading || !session || stage === "pin") return;
    if (role === "staff") {
      setStage("pin");
      return;
    }
    void navigate({ to: "/", replace: true });
  }, [loading, session, role, navigate, stage]);

  const submitPin = async () => {
    setBusy(true);
    setMessage("");
    const result = await confirmStaffPin({ data: { pin } });
    setBusy(false);
    setMessage(result.message);
    if (result.ok) void navigate({ to: "/staff", replace: true });
  };

  const demoStaff = async () => {
    setBusy(true);
    setMessage("");
    const result = await signInAsDemoStaff();
    if (!result.ok) {
      setBusy(false);
      setMessage(result.message);
      return;
    }
    setStage("pin");
    const { error } = await supabase.auth.verifyOtp({
      type: "email",
      token_hash: result.tokenHash,
    });
    setBusy(false);
    if (error) {
      setMessage("PACE could not open the demo staff account.");
      return;
    }
    await refresh();
    setStage("pin");
    setMessage("Demo staff account ready. Choose any 4-digit PIN.");
  };

  const submit = async () => {
    setBusy(true);
    setMessage("");
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { role: "staff", display_name: name.trim() || email.trim() },
        },
      });
      setBusy(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      if (!data.session) {
        setMessage("Check your email to confirm your account, then sign in.");
        return;
      }
      await refresh();
      setStage("pin");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setMessage("That email and password did not match.");
      return;
    }
    await refresh();
    setStage("pin");
  };

  if (stage === "pin") {
    return (
      <div className="simple-page">
        <p className="eyebrow">Confirm</p>
        <h1>Enter your staff PIN</h1>
        <p className="simple-lead">
          Staff Mode always asks for a 4-digit PIN, so a resident can never reach it by accident.
          The first PIN you enter becomes your PIN.
        </p>
        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submitPin();
          }}
        >
          <label htmlFor="staff-pin">4-digit staff PIN</label>
          <input
            id="staff-pin"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
          />
          <Button size="xl" type="submit" disabled={busy || pin.length !== 4}>
            Enter Staff Mode
          </Button>
        </form>
        {message && (
          <p className="pace-reply" role="status">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="welcome-page staff-welcome-page">
      <header className="welcome-masthead">
        <Brand />
        <h1 className="auth-title">Staff access</h1>
        <p>Resident support, requests, and meaningful moments.</p>
      </header>

      <main className="welcome-content">
        <Button className="staff-demo-entry" size="xl" disabled={busy} onClick={() => void demoStaff()}>
          <MonitorPlay />
          <span>
            <strong>Open staff demo</strong>
            <small>Fictional residents and sample activity</small>
          </span>
          <span className="staff-demo-pin">PIN 4321</span>
        </Button>

        <div className="welcome-divider"><span>Staff account</span></div>
        <div className="staff-signin-heading">
          <BriefcaseBusiness aria-hidden />
          <div>
            <h2>{mode === "in" ? "Sign in securely" : "Create a staff account"}</h2>
            <p>Only assigned residents are shown after sign-in.</p>
          </div>
        </div>

      <form
        className="auth-form welcome-signin"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        {mode === "up" && (
          <>
            <label htmlFor="staff-name">Your name</label>
            <input
              id="staff-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jordan Lee"
            />
          </>
        )}
        <label htmlFor="staff-email">Work email</label>
        <input
          id="staff-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label htmlFor="staff-password">Password</label>
        <input
          id="staff-password"
          type="password"
          autoComplete={mode === "in" ? "current-password" : "new-password"}
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button size="xl" type="submit" disabled={busy || !email.trim() || password.length < 8}>
          {mode === "in" ? "Sign in" : "Create account"}
        </Button>
      </form>

      {message && (
        <p className="pace-reply" role="status">
          {message}
        </p>
      )}

      <Button className="welcome-switch" size="xl" variant="outline" onClick={() => setMode(mode === "in" ? "up" : "in")}> 
        {mode === "in" ? "Create a staff account" : "I already have an account"}
      </Button>

      <p className="welcome-privacy">
        <ShieldCheck aria-hidden />
        <span><strong>Private staff access.</strong> PACE shows only the residents assigned to your account.</span>
      </p>

      <Button className="back-to-senior" size="xl" variant="ghost" asChild>
        <Link to="/auth"><ArrowLeft /> Back to senior welcome</Link>
      </Button>
      </main>
    </div>
  );
}
