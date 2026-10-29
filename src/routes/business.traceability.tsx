import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business/traceability")({
  beforeLoad: () => {
    throw redirect({ to: "/business/products" });
  },
});
