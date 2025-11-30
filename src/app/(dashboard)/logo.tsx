import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { Palette } from "lucide-react";

import { cn } from "@/lib/utils";

const font = Space_Grotesk({
  weight: ["700"],
  subsets: ["latin"],
});

export const Logo = () => {
  return (
    <Link href="/">
      <div className="flex items-center gap-x-3 hover:opacity-75 h-[68px] px-4">
        <div className="size-10 p-1 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
          <div className="size-full bg-white rounded-lg flex items-center justify-center">
            <Palette className="size-6 text-purple-600" />
          </div>
        </div>
        <h1 className={cn(
          font.className, 
          "text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
        )}>
          Editei
        </h1>
      </div>
    </Link>
  );
};
