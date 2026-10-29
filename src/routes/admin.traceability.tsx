import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/traceability")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/products" });
  },
});
