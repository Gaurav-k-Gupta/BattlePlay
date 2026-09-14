import { Card } from "@/components/ui/card";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RegistrationsManager } from "./registrations-manager";

export default async function RegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await prisma.match.findUnique({ 
    where: { id },
    include: {
      registrations: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { slotNumber: "asc" }
      }
    }
  });

  if (!match) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-black text-white">Registrations</h2>
          <p className="text-muted text-sm mt-1">{match.title}</p>
        </div>
        <Link href="/admin/matches" className="px-4 py-2 border border-line rounded-lg text-white font-bold text-sm hover:bg-elevated transition">
          Back
        </Link>
      </div>

      <Card className="p-6">
        <RegistrationsManager 
          match={{
            ...match,
            entryFee: Number(match.entryFee),
            prizePool: Number(match.prizePool),
            prizePerFinish: Number(match.prizePerFinish),
            winnerPrize: Number(match.winnerPrize),
            runnerUpPrize: Number(match.runnerUpPrize),
          }} 
          initialRegistrations={match.registrations} 
        />
      </Card>
    </div>
  );
}
