import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { PromosManager } from "./promos-manager";

export default async function AdminPromosPage() {
  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { redemptions: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-black text-white">Promo Codes</h2>
          <p className="text-muted text-sm mt-1">Create and manage bonus codes</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <PromosManager initialPromos={promos.map(p => ({
          ...p,
          bonusAmount: p.bonusAmount.toNumber(),
          redemptionsCount: p._count.redemptions
        }))} />
      </Card>
    </div>
  );
}
