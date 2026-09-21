import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { usePaceAuth } from "@/lib/pace-auth";
import { confirmStaffPin } from "@/lib/pace-pin.functions";

export const Route = createFileRoute("/staff-signin")({
  head: () => ({
    meta: [
      { title: "Staff sign in — PACE" },
      {
        name: "description",
        content: "Caregivers and staff sign in to plan meaningful moments with the residents they support.",
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
          Staff Mode always asks for a 4-digit PIN, so a resident can never reach it by accident. The
          first PIN you enter becomes your PIN.
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
    <div className="simple-page">
      <p className="eyebrow">Caregiver &amp; Staff</p>
      <h1>{mode === "in" ? "Staff sign in" : "Create a staff account"}</h1>
      <p className="simple-lead">
        Staff accounts see only the residents assigned to them. All resident content in this
        demonstration is fictional.
      </p>

      <form
        className="auth-form"
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

      <Button size="xl" variant="outline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "Create a staff account" : "I already have an account"}
      </Button>

      <p className="simple-note">
        <strong>Your privacy:</strong> PACE stores only your name, email, choices and notes so the
        care team can support residents. It is never sold or shared outside your care team, and any
        account can be deleted at any time.
      </p>

      <p className="simple-note">
        Signing in for yourself or a loved one? <a href="/auth">Go to the simple sign in</a>
      </p>
    </div>
  );
}
