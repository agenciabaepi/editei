"use client";

import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";
import { Loader } from "lucide-react";

import { ProfileForm } from "@/features/profile/components/profile-form";
import { ProfileStats } from "@/features/profile/components/profile-stats";
import { ProfileHeader } from "@/features/profile/components/profile-header";

const ProfilePage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    redirect("/");
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <ProfileHeader user={user} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProfileForm user={user} />
        </div>
        <div className="space-y-6">
          <ProfileStats userId={user.id} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
