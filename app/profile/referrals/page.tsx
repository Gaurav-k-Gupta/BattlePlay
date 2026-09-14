import Link from "next/link";
import { Card } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReferralLinkCopy } from "@/components/referral-link-copy";

export default async function ReferralsPage() {
  const user = await requirePageUser();
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { referralCode: true }
  });

  if (!userData) return null;

  const referredUsersCount = await prisma.user.count({
    where: { referredBy: user.id }
  });

  const referralEarnings = await prisma.transaction.aggregate({
    where: { userId: user.id, type: "REFERRAL_BONUS", status: "SUCCESS" },
    _sum: { amount: true }
  });

  const totalEarned = referralEarnings._sum.amount?.toNumber() || 0;

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-10">
      <div>
        <Link className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors" href="/profile">← Back to Profile</Link>
        <p className="mt-6 text-xs font-bold tracking-[0.2em] text-violet-400">REFERRALS</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white">Invite friends, earn cash</h1>
      </div>

      <Card className="p-8 border border-violet-500/30 bg-violet-900/10 backdrop-blur relative overflow-hidden" tone="elevated">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl font-black text-white">Your unique referral link</h2>
            <p className="text-sm text-violet-300 mt-2">When a friend signs up using your link and makes their first top-up, you both get ₹10 bonus cash!</p>
          </div>
          
          <ReferralLinkCopy referralCode={userData.referralCode} />
        </div>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="p-6 text-center border-white/5 bg-black/40">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Friends Referred</p>
          <p className="mt-2 font-display text-5xl font-black text-white">{referredUsersCount}</p>
        </Card>
        <Card className="p-6 text-center border-green-500/30 bg-green-900/10">
          <p className="text-xs font-bold uppercase tracking-widest text-green-400">Total Earned</p>
          <p className="mt-2 font-display text-5xl font-black text-green-400">₹{totalEarned}</p>
        </Card>
      </div>
    </main>
  );
}
