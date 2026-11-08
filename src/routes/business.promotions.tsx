import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business/promotions")({
  beforeLoad: () => {
    throw redirect({ to: "/business/products" });
  },
});
