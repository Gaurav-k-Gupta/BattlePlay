import Link from "next/link";

import { ProfileForm } from "@/components/profile-form";
import { Card } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await requirePageUser();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-7 px-4 py-8 sm:px-6 lg:px-10">
      <div className="space-y-2">
        <p className="text-xs font-bold tracking-[0.2em] text-violet-400">PROFILE</p>
        <h1 className="font-display text-4xl font-black tracking-tight text-white">Your player profile</h1>
        <p className="text-muted">Signed in as {user.email}. Your Google account manages sign-in.</p>
      </div>
      <Card className="p-5 sm:p-6" tone="elevated"><ProfileForm initialProfile={user} /></Card>
      <nav className="grid gap-3 sm:grid-cols-3">
        <Link className="rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-white transition hover:border-violet-500 hover:bg-violet-700/15" href="/profile/history">Match history</Link>
        <Link className="rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-white transition hover:border-violet-500 hover:bg-violet-700/15" href="/profile/stats">Stats</Link>
        <Link className="rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-white transition hover:border-violet-500 hover:bg-violet-700/15" href="/terms">Terms</Link>
      </nav>
    </main>
  );
}
