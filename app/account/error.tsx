"use client";

import { PageError } from "@/components/ui/page-error";

export default function AccountError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError message="We could not load your account." reset={reset} />;
}
