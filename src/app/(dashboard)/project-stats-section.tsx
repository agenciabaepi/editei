"use client";

import { 
  BarChart3, 
  Clock, 
  FileText, 
  Download,
  TrendingUp,
  Calendar,
  Loader
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProjectStats } from "@/features/projects/api/use-project-stats";

export const ProjectStatsSection = () => {
  const { data: stats, isLoading, error } = useProjectStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Sua Atividade
          </h3>
          <Loader className="w-4 h-4 animate-spin" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Sua Atividade
        </h3>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Falha ao carregar estatísticas. Tente novamente mais tarde.
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData = [
    {
      title: "Projetos Criados",
      value: stats?.totalProjects.toString() || "0",
      change: `+${stats?.projectsThisWeek || 0} esta semana`,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Tempo Criando",
      value: `${stats?.designTime || 0}h`,
      change: `+${stats?.designTimeThisWeek || 0}h esta semana`,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Downloads",
      value: stats?.totalDownloads.toString() || "0",
      change: `+${stats?.downloadsThisMonth || 0} este mês`,
      icon: Download,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Sua Atividade
        </h3>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 mr-1" />
          Últimos 30 dias
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsData.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <IconComponent className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progresso da Meta Semanal</CardTitle>
          <CardDescription>Criar 5 novos designs esta semana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{stats?.projectsThisWeek || 0} de 5 concluídos</span>
              <span>{Math.round(((stats?.projectsThisWeek || 0) / 5) * 100)}%</span>
            </div>
            <Progress value={Math.round(((stats?.projectsThisWeek || 0) / 5) * 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
