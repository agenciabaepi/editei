import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
};

export const SidebarItem = ({
  icon: Icon,
  label,
  href,
  isActive,
  onClick,
}: SidebarItemProps) => {
  return (
    <Link href={href} onClick={onClick} className="flex flex-col items-center justify-center py-3 group">
      <div className={cn(
        "flex items-center justify-center w-12 h-12 rounded-xl transition-all",
        isActive 
          ? "bg-white shadow-md" 
          : "bg-transparent group-hover:bg-white/50",
      )}>
        <Icon className={cn(
          "size-5 stroke-2 transition-colors",
          isActive ? "text-purple-600" : "text-purple-700 group-hover:text-purple-600"
        )} />
      </div>
      <span className={cn(
        "text-xs font-medium mt-1.5 transition-colors text-center",
        isActive ? "text-purple-700" : "text-purple-600/80 group-hover:text-purple-700"
      )}>
        {label}
      </span>
    </Link>
  );
};
