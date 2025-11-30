"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu />
      </Button>
      <SheetContent side="left" className="p-0 bg-secondary pt-10 w-72">
        <AdminSidebar />
      </SheetContent>
    </Sheet>
  );
};
