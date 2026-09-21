import { createFileRoute, redirect } from "@tanstack/react-router";

// Kept so older links and bookmarks still work.
export const Route = createFileRoute("/relax")({
  beforeLoad: () => {
    throw redirect({ to: "/quiet", replace: true });
  },
});
