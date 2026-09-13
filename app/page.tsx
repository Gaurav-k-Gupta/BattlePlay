import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { SignInButton } from "@/components/sign-in-button";
import { Card } from "@/components/ui/card";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col justify-center gap-7 px-4 py-10 sm:px-6 lg:min-h-[calc(100vh-4rem)] lg:px-10">
      <p className="text-xs font-bold tracking-[0.2em] text-violet-400">BATTLEPLAY · ESPORTS ARENA</p>
      <h1 className="max-w-3xl font-display text-4xl font-black tracking-tight text-white sm:text-5xl">Fantasy esports, built for fair play.</h1>
      <p className="max-w-2xl text-base leading-7 text-muted">Compete in organized tournaments, build your history, and keep every reward transparent.</p>
      {session?.user ? (
        <Card className="max-w-xl p-6" tone="elevated">
          <p className="text-sm text-muted">Signed in as</p>
          <p className="mt-1 font-semibold text-white">{session.user.email}</p>
          <Link className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500" href="/profile">
            Open player profile
          </Link>
        </Card>
      ) : (
        <SignInButton />
      )}
    </main>
  );
}
