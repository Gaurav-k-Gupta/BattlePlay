import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "./users-manager";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-black text-white">User Management</h2>
          <p className="text-muted text-sm mt-1">Manage accounts and platform bans</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <UsersManager initialUsers={users} />
      </Card>
    </div>
  );
}
