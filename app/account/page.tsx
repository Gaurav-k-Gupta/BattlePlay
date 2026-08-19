import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-6 py-16">
      <p className="text-sm font-semibold tracking-[0.2em] text-cyan-300">AUTHENTICATED</p>
      <h1 className="text-4xl font-bold">Welcome, {session.user.name ?? session.user.email}</h1>
      <p className="text-slate-300">Your account ID is {session.user.id} and your role is {session.user.role}.</p>
    </main>
  );
}
