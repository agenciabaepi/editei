"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar } from "lucide-react";

// Define User type locally since we removed next-auth
type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

interface ProfileHeaderProps {
  user: User;
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const joinDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-start gap-6">
        <div className="relative">
          <Avatar className="size-20">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback className="bg-blue-500 text-white text-2xl font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm">
            <Crown className="size-4 text-yellow-500 fill-yellow-500" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Pro Member
            </Badge>
          </div>
          
          <p className="text-gray-600 mb-3">{user.email}</p>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="size-4" />
            <span>Member since {joinDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
