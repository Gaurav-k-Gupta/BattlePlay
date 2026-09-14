import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { WithdrawalsManager } from "./withdrawals-manager";

export default async function AdminWithdrawalsPage() {
  const withdrawals = await prisma.withdrawalRequest.findMany({
    orderBy: [
      { status: "asc" }, // PENDING first typically, though this sorts alphabetically. Let's sort by requestedAt instead.
      { requestedAt: "desc" }
    ],
    include: {
      user: { select: { name: true, email: true } }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-black text-white">Withdrawals Management</h2>
          <p className="text-muted text-sm mt-1">Review and process payout requests</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <WithdrawalsManager initialWithdrawals={withdrawals} />
      </Card>
    </div>
  );
}
