import { createFileRoute, redirect } from "@tanstack/react-router";

// Kept so older links and bookmarks still work.
export const Route = createFileRoute("/music")({
  beforeLoad: () => {
    throw redirect({ to: "/listen", replace: true });
  },
});
