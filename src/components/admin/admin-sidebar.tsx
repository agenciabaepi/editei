"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  FolderOpen, 
  Settings, 
  Shield,
  Database,
  Activity
} from "lucide-react";

const adminRoutes = [
  {
    label: "Dashboard",
    icon: BarChart3,
    href: "/admin",
    color: "text-sky-500"
  },
  {
    label: "Users",
    icon: Users,
    href: "/admin/users",
    color: "text-violet-500"
  },
  {
    label: "Subscriptions",
    icon: CreditCard,
    href: "/admin/subscriptions",
    color: "text-pink-700"
  },
  {
    label: "Projects",
    icon: FolderOpen,
    href: "/admin/projects",
    color: "text-orange-700"
  },
  {
    label: "System",
    icon: Activity,
    href: "/admin/system",
    color: "text-red-500"
  }
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white fixed left-0 top-0 w-[280px] z-50">
      <div className="px-3 py-2 flex-1">
        <Link href="/admin" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            Admin Panel
          </h1>
        </Link>
        <div className="space-y-1">
          {adminRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
