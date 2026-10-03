import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode, Suspense } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { VitaMoveProvider } from "../lib/vitamove-state";
import { AppShell } from "../components/vitamove/AppShell";
import { Brand } from "../components/vitamove/Brand";
import { LumaStrideWellnessProvider } from "../lib/lumastride-wellness";
import { PaceAuthProvider } from "../lib/pace-auth";

function NotFoundComponent() {
  return (
    <div className="simple-page not-found-page">
      <Brand />
      <h1>We could not find that page</h1>
      <p className="simple-lead">
        Nothing is wrong. The page you were looking for has moved or is no longer here.
      </p>
      <Link to="/" className="not-found-home">
        Go to the home page
      </Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center"><Brand /></div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PACE — Personalized Aging & Connection Experience" },
      { name: "description", content: "A warm, voice-first platform helping older adults express what they want and connect with meaningful people and experiences." },
      { name: "author", content: "PACE — Personalized Aging & Connection Experience" },
      { property: "og:title", content: "PACE — Personalized Aging & Connection Experience" },
      { property: "og:description", content: "PACE helps older adults show what matters to them." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap",
      },
      { rel: "icon", href: "/favicon.png?v=pace-path", type: "image/png", sizes: "512x512" },
      { rel: "shortcut icon", href: "/favicon.png?v=pace-path", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=pace-path", sizes: "180x180" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <a href="#pace-main" className="skip-link">
          Skip to main content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <PaceAuthProvider><VitaMoveProvider><LumaStrideWellnessProvider><AppShell><Outlet /></AppShell></LumaStrideWellnessProvider></VitaMoveProvider></PaceAuthProvider>
    </QueryClientProvider>
  );
}
