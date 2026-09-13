"use client";

import { PageError } from "@/components/ui/page-error";

export default function MatchHistoryError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError message="We could not load your match history." reset={reset} />;
}
