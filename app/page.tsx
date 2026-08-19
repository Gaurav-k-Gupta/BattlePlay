import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { SignInButton } from "@/components/sign-in-button";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-semibold tracking-[0.2em] text-cyan-300">BATTLEPLAY</p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Fantasy esports, built for fair play.</h1>
      {session?.user ? (
        <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-5">
          <p>Signed in as {session.user.email}.</p>
          <Link className="text-cyan-300 underline" href="/account">
            Open the protected account check
          </Link>
        </div>
      ) : (
        <SignInButton />
      )}
    </main>
  );
}
