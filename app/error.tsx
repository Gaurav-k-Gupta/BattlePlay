"use client";

import { PageError } from "@/components/ui/page-error";

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError message="BattlePlay could not load this screen." reset={reset} />;
}
