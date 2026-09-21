import { createFileRoute, redirect } from "@tanstack/react-router";

// Kept so older links and bookmarks still work.
export const Route = createFileRoute("/community")({
  beforeLoad: () => {
    throw redirect({ to: "/connect", replace: true });
  },
});
