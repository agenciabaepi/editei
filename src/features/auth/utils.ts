import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";

export const protectServer = async () => {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/sign-in");
  }
};
