import { createFileRoute, redirect } from "@tanstack/react-router";

// Keep old bookmarks working while retiring the price comparison flow.
export const Route = createFileRoute("/compare")({
  beforeLoad: () => {
    throw redirect({ to: "/shop" });
  },
});
