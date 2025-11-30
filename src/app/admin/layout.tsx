import { requireAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminNavbar } from "@/components/admin/admin-navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  
  return (
    <div className="bg-muted h-full">
      <AdminSidebar />
      <div className="lg:pl-[280px] flex flex-col h-full">
        <AdminNavbar />
        <main className="bg-white flex-1 overflow-auto p-6 lg:rounded-tl-2xl">
          {children}
        </main>
      </div>
    </div>
  );
}
