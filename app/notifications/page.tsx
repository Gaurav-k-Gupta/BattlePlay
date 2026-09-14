import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { NotificationList } from "./notification-list";

export default async function NotificationsPage() {
  const user = await requirePageUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto w-full max-w-3xl space-y-7 px-4 py-8 sm:px-6 lg:px-10">
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-violet-400">INBOX</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white">Notifications</h1>
      </div>

      <Card className="p-0 overflow-hidden border border-white/5 bg-canvas/40" tone="elevated">
        <NotificationList initialNotifications={notifications} />
      </Card>
    </main>
  );
}
