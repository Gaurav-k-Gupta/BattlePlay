import Link from "next/link";

import { ProfileForm } from "@/components/profile-form";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { SignInButton } from "@/components/sign-in-button";
import { SignOutButton } from "@/components/sign-out-button";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-2xl space-y-7 px-4 py-24 sm:px-6 lg:px-10 text-center">
        <div className="space-y-4">
          <p className="text-xs font-bold tracking-[0.2em] text-violet-400">ACCESS RESTRICTED</p>
          <h1 className="font-display text-4xl font-black tracking-tight text-white">Sign In Required</h1>
          <p className="text-muted max-w-md mx-auto">You need to log in to view and manage your BattlePlay profile, match history, and wallet.</p>
        </div>
        <div className="flex justify-center pt-8">
          <SignInButton />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl space-y-7 px-4 py-8 sm:px-6 lg:px-10">
      <div className="space-y-2">
        <p className="text-xs font-bold tracking-[0.2em] text-violet-400">PROFILE</p>
        <h1 className="font-display text-4xl font-black tracking-tight text-white">Your player profile</h1>
        <p className="text-muted">Signed in as {user.email}. Your Google account manages sign-in.</p>
      </div>
      <Card className="p-5 sm:p-6" tone="elevated">
        <ProfileForm initialProfile={user} />
      </Card>
      <nav className="grid gap-3 sm:grid-cols-3">
        <Link className="rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-white transition hover:border-violet-500 hover:bg-violet-700/15" href="/profile/history">Match history</Link>
        <Link className="rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-white transition hover:border-violet-500 hover:bg-violet-700/15" href="/profile/stats">Stats</Link>
        <Link className="rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-white transition hover:border-violet-500 hover:bg-violet-700/15" href="/terms">Terms</Link>
      </nav>
      <div className="pt-4 border-t border-line mt-8">
        <SignOutButton />
      </div>
    </main>
  );
}
