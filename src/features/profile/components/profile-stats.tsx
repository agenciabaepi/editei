"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Image, 
  Calendar, 
  TrendingUp,
  Folder,
  Clock
} from "lucide-react";

interface ProfileStatsProps {
  userId?: string;
}

interface UserStats {
  totalProjects: number;
  totalImages: number;
  recentActivity: number;
  storageUsed: string;
  accountAge: string;
  lastActive: string;
}

export const ProfileStats = ({ userId }: ProfileStatsProps) => {
  const [stats, setStats] = useState<UserStats>({
    totalProjects: 0,
    totalImages: 0,
    recentActivity: 0,
    storageUsed: "0 MB",
    accountAge: "0 days",
    lastActive: "Just now"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  const statItems = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Images Uploaded",
      value: stats.totalImages,
      icon: Image,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Recent Activity",
      value: stats.recentActivity,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="space-y-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{item.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? "..." : item.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <Icon className={`size-5 ${item.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="size-4 text-gray-500" />
              <span className="text-sm text-gray-600">Storage Used</span>
            </div>
            <Badge variant="secondary">{isLoading ? "..." : stats.storageUsed}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-gray-500" />
              <span className="text-sm text-gray-600">Account Age</span>
            </div>
            <Badge variant="outline">{isLoading ? "..." : stats.accountAge}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-gray-500" />
              <span className="text-sm text-gray-600">Last Active</span>
            </div>
            <span className="text-sm text-gray-500">
              {isLoading ? "..." : stats.lastActive}
            </span>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
