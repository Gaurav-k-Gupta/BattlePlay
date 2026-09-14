"use client";
import { PageError } from "@/components/ui/page-error";
export default function MatchesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <PageError message="We could not load matches." reset={reset} />; }
