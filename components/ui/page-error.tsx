"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PageError({ message, reset }: { message: string; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-10">
      <Card className="w-full p-6" tone="elevated">
        <p className="text-xs font-bold tracking-[0.2em] text-ember-400">SOMETHING WENT WRONG</p>
        <h1 className="mt-2 font-display text-2xl font-black text-white">{message}</h1>
        <Button className="mt-5" onClick={reset} type="button">Try again</Button>
      </Card>
    </main>
  );
}
