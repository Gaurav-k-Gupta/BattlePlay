import { Card } from "@/components/ui/card";
import Link from "next/link";
import { MatchForm } from "./match-form";

export default function CreateMatchPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-black text-white">Create Match</h2>
        <Link href="/admin/matches" className="px-4 py-2 border border-line rounded-lg text-white font-bold text-sm hover:bg-elevated transition">
          Cancel
        </Link>
      </div>

      <Card className="p-6">
        <MatchForm />
      </Card>
    </div>
  );
}
