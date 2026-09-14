import { requirePageUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();
  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 px-4 py-8 sm:px-6 lg:px-10">
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-ember-400">ADMINISTRATOR</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white">Control Panel</h1>
      </div>

      {children}
    </div>
  );
}
