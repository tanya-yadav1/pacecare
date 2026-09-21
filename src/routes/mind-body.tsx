import { createFileRoute, redirect } from "@tanstack/react-router";

// Kept so older links and bookmarks still work.
export const Route = createFileRoute("/mind-body")({
  beforeLoad: () => {
    throw redirect({ to: "/explore", replace: true });
  },
});
