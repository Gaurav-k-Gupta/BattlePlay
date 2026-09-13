"use client";

import { PageError } from "@/components/ui/page-error";

export default function TermsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError message="We could not load the terms." reset={reset} />;
}
