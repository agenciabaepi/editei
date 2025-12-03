import { SidebarRoutes } from "./sidebar-routes";

export const Sidebar = () => {
  return (
    <aside className="hidden lg:flex fixed flex-col w-[80px] left-0 shrink-0 h-full bg-gradient-to-b from-purple-50 to-purple-100/50">
      <SidebarRoutes />
    </aside>
  );
};
