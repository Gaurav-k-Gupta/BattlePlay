import { Card } from "@/components/ui/card";

export function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5" tone="elevated">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="mt-2 font-display text-3xl font-bold tracking-tight text-white">{value}</dd>
    </Card>
  );
}
