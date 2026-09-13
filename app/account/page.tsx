import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/auth";
import { Card } from "@/components/ui/card";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col justify-center gap-6 px-4 py-10 sm:px-6 lg:min-h-[calc(100vh-4rem)] lg:px-10">
      <p className="text-xs font-bold tracking-[0.2em] text-violet-400">ACCOUNT READY</p>
      <h1 className="font-display text-4xl font-black tracking-tight text-white">Welcome, {session.user.name ?? session.user.email}</h1>
      <Card className="space-y-3 p-6" tone="elevated">
        <p className="text-muted">Your Google account is connected to BattlePlay.</p>
        <p className="text-sm text-muted">Account ID: <span className="font-mono text-white">{session.user.id}</span></p>
        <p className="text-sm text-muted">Role: <span className="font-semibold text-violet-400">{session.user.role}</span></p>
      </Card>
      <Link className="w-fit rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500" href="/profile">
        Open your profile
      </Link>
    </main>
  );
}
