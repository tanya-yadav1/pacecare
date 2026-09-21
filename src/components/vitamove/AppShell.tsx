import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import { Accessibility, Home, LogOut, Menu, Settings, UsersRound, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "./Brand";
import { PageVoice } from "@/components/pace/PageVoice";
import { Button } from "@/components/ui/button";
import { useLumaStrideWellness } from "@/lib/lumastride-wellness";
import { usePaceAuth } from "@/lib/pace-auth";

const PUBLIC_PATHS = new Set(["/auth", "/staff-signin", "/pace-demo"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { mode, setMode } = useLumaStrideWellness();
  const { loading, session, role, signOut } = usePaceAuth();
  const [mobile, setMobile] = useState(false);
  const isDemo = path === "/pace-demo";
  const isStaffArea = path === "/staff";
  const isStaff = isStaffArea || mode === "staff";
  const legacyPaths = new Set([
    "/assessment",
    "/care",
    "/clinician",
    "/dashboard",
    "/doctor-visit",
    "/move",
    "/my-day",
    "/overlay",
    "/remedies",
    "/rewards",
    "/screening",
    "/symptoms",
    "/therapy",
    "/treatment-info",
    "/vocal",
    "/walk",
  ]);
  if (legacyPaths.has(path)) return <Navigate to="/" replace />;
  if (isDemo) return <>{children}</>;
  if (PUBLIC_PATHS.has(path)) return <main className="pace-main">{children}</main>;

  if (loading) {
    return (
      <main className="pace-main">
        <p className="simple-note" role="status">
          One moment…
        </p>
      </main>
    );
  }
  if (!session) return <Navigate to={isStaffArea ? "/staff-signin" : "/auth"} replace />;
  if (isStaffArea && role !== "staff") return <Navigate to="/" replace />;

  const links = isStaff
    ? ([
        ["/staff", "Overview"],
        ["/connect", "Connections"],
        ["/progress", "Moments"],
      ] as const)
    : ([
        ["/", "Home"],
        ["/listen", "Listen"],
        ["/connect", "Connect"],
        ["/explore", "Explore"],
        ["/quiet", "Quiet"],
      ] as const);
  return (
    <div className="min-h-screen bg-background">
      <header className="pace-header">
        <div className="pace-header-inner">
          <Link to="/" aria-label="PACE home" onClick={() => setMode("senior")}>
            <Brand compact />
          </Link>
          <nav className="pace-nav" aria-label="PACE navigation">
            {links.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className={path === to ? "nav-link nav-link-active" : "nav-link"}
                aria-current={path === to ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Button variant="ghost" size="iconLg" asChild>
              <Link to="/accessibility" aria-label="Accessibility settings">
                <Accessibility />
              </Link>
            </Button>
            {role === "staff" && (
              <Button
                variant="outline"
                size="lg"
                asChild
                onClick={() => setMode(isStaff ? "senior" : "staff")}
              >
                <Link to={isStaff ? "/" : "/staff"}>
                  {isStaff ? <Home /> : <UsersRound />}
                  <span className="hidden sm:inline">{isStaff ? "Senior Mode" : "Staff Mode"}</span>
                </Link>
              </Button>
            )}
            {isStaff && role === "staff" && (
              <Button variant="ghost" size="iconLg" onClick={() => void signOut()} aria-label="Sign out">
                <LogOut />
              </Button>
            )}
            <Button
              className="mobile-menu-button"
              variant="outline"
              size="iconLg"
              onClick={() => setMobile(!mobile)}
              aria-label="Open navigation"
            >
              {mobile ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {mobile && (
          <nav className="mobile-simple-nav" aria-label="PACE mobile navigation">
            {links.map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setMobile(false)} className={path === to ? "nav-link-active" : ""}>
                {label}
              </Link>
            ))}
            <Link to="/accessibility" onClick={() => setMobile(false)}>
              <Settings />
              Settings
            </Link>
          </nav>
        )}
      </header>

      <main className="pace-main">
        {children}
        <PageVoice />
      </main>
      <footer className="pace-disclaimer">
        PACE supports personal choice and connection. It does not diagnose, cure, or treat any medical or mental-health
        condition.
      </footer>
    </div>
  );
}
