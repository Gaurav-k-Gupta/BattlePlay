import { Card } from "@/components/ui/card";
import Link from "next/link";
import { MatchForm } from "../../create/match-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await prisma.match.findUnique({ where: { id } });

  if (!match) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-black text-white">Edit Match</h2>
          <p className="text-muted text-sm mt-1">{match.title}</p>
        </div>
        <Link href="/admin/matches" className="px-4 py-2 border border-line rounded-lg text-white font-bold text-sm hover:bg-elevated transition">
          Cancel
        </Link>
      </div>

      <Card className="p-6">
        <MatchForm initialData={{
          ...match,
          entryFee: Number(match.entryFee),
          prizePool: Number(match.prizePool),
          prizePerFinish: Number(match.prizePerFinish),
          winnerPrize: Number(match.winnerPrize),
          runnerUpPrize: Number(match.runnerUpPrize),
        }} />
      </Card>
    </div>
  );
}
