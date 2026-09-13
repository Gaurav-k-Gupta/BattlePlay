"use client";

import { PageError } from "@/components/ui/page-error";

export default function WalletError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError message="We could not load your wallet." reset={reset} />;
}
