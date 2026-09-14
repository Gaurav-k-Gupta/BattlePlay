"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MatchForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      gameType: formData.get("gameType"),
      category: formData.get("category"),
      paymentType: formData.get("paymentType"),
      map: formData.get("map"),
      entryFee: Number(formData.get("entryFee")),
      prizePool: Number(formData.get("prizePool")),
      prizePerFinish: Number(formData.get("prizePerFinish")),
      winnerPrize: Number(formData.get("winnerPrize")),
      runnerUpPrize: Number(formData.get("runnerUpPrize")),
      lobbySize: Number(formData.get("lobbySize")),
      matchTime: formData.get("matchTime"),
      rules: formData.get("rules"),
      ...(initialData ? {
        status: formData.get("status"),
        roomId: formData.get("roomId") || null,
        roomPassword: formData.get("roomPassword") || null,
        telegramGroupLink: formData.get("telegramGroupLink") || null,
      } : {})
    };

    const url = initialData ? `/api/admin/matches/${initialData.id}` : "/api/admin/matches";
    const method = initialData ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      return setError(result.error || "Something went wrong.");
    }

    router.push("/admin/matches");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold text-muted uppercase">Title</span>
          <input name="title" defaultValue={initialData?.title} required className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted uppercase">Map</span>
          <input name="map" defaultValue={initialData?.map} required className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="text-xs font-bold text-muted uppercase">Game Type</span>
          <select name="gameType" defaultValue={initialData?.gameType || "SOLO"} className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white">
            <option value="SOLO">Solo</option>
            <option value="DUO">Duo</option>
            <option value="SQUAD">Squad</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted uppercase">Category</span>
          <select name="category" defaultValue={initialData?.category || "FULL_MAP"} className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white">
            <option value="FULL_MAP">Full Map</option>
            <option value="CS">Clash Squad (CS)</option>
            <option value="LW">Lone Wolf (LW)</option>
            <option value="HEAD">Headshot</option>
            <option value="LW_HEAD">LW Head</option>
            <option value="FREE">Free</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted uppercase">Payment Type</span>
          <select name="paymentType" defaultValue={initialData?.paymentType || "PAID"} className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white">
            <option value="PAID">Paid</option>
            <option value="FREE">Free</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="text-xs font-bold text-muted uppercase">Entry Fee (₹)</span>
          <input name="entryFee" type="number" defaultValue={initialData?.entryFee ?? 10} required className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted uppercase">Lobby Size</span>
          <input name="lobbySize" type="number" defaultValue={initialData?.lobbySize ?? 48} required className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted uppercase">Match Time (Local)</span>
          {/* Using datetime-local. Value must be YYYY-MM-DDTHH:MM */}
          <input name="matchTime" type="datetime-local" defaultValue={initialData?.matchTime ? new Date(new Date(initialData.matchTime).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""} required className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white [color-scheme:dark]" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="block">
          <span className="text-xs font-bold text-muted uppercase">Prize Pool</span>
          <input name="prizePool" type="number" defaultValue={initialData?.prizePool ?? 0} required className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted uppercase">Per Finish</span>
          <input name="prizePerFinish" type="number" defaultValue={initialData?.prizePerFinish ?? 0} required className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted uppercase">Winner Prize</span>
          <input name="winnerPrize" type="number" defaultValue={initialData?.winnerPrize ?? 0} required className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted uppercase">Runner Up</span>
          <input name="runnerUpPrize" type="number" defaultValue={initialData?.runnerUpPrize ?? 0} required className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white" />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-bold text-muted uppercase">Rules / Instructions</span>
        <textarea name="rules" defaultValue={initialData?.rules ?? "1. No hackers\n2. Play fair"} rows={4} required className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white"></textarea>
      </label>

      {initialData && (
        <div className="pt-4 mt-4 border-t border-line space-y-4">
          <h3 className="font-bold text-white mb-2">Live Operations (Edit Only)</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold text-muted uppercase">Status</span>
              <select name="status" defaultValue={initialData.status} className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white">
                <option value="UPCOMING">Upcoming</option>
                <option value="LIVE">Live</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-muted uppercase">Telegram Link</span>
              <input name="telegramGroupLink" defaultValue={initialData.telegramGroupLink ?? ""} className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white" placeholder="https://t.me/..." />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold text-muted uppercase">Room ID</span>
              <input name="roomId" defaultValue={initialData.roomId ?? ""} className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-muted uppercase">Room Password</span>
              <input name="roomPassword" defaultValue={initialData.roomPassword ?? ""} className="mt-1 w-full rounded-lg bg-canvas border border-line p-2.5 text-sm text-white" />
            </label>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-ember-400 font-bold">{error}</p>}
      
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : (initialData ? "Save Changes" : "Create Match")}
      </Button>
    </form>
  );
}
