"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Server, 
  Database, 
  HardDrive, 
  Cpu, 
  MemoryStick,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Zap
} from "lucide-react";

interface SystemStats {
  uptime: string;
  version: string;
  environment: string;
  database: {
    status: "healthy" | "warning" | "error";
    connections: number;
    size: string;
  };
  server: {
    cpu: number;
    memory: number;
    disk: number;
  };
  performance: {
    avgResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
  };
  services: {
    name: string;
    status: "running" | "stopped" | "error";
    lastCheck: string;
  }[];
}

export default function SystemPage() {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    uptime: "0 days, 0 hours",
    version: "1.0.0",
    environment: "development",
    database: {
      status: "healthy",
      connections: 0,
      size: "0 MB"
    },
    server: {
      cpu: 0,
      memory: 0,
      disk: 0
    },
    performance: {
      avgResponseTime: 0,
      requestsPerMinute: 0,
      errorRate: 0
    },
    services: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSystemStats = async () => {
    try {
      // Mock system stats - in production, this would come from actual system monitoring
      const mockStats: SystemStats = {
        uptime: "5 days, 12 hours",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        database: {
          status: "healthy",
          connections: 12,
          size: "245 MB"
        },
        server: {
          cpu: Math.floor(Math.random() * 30) + 10, // 10-40%
          memory: Math.floor(Math.random() * 40) + 30, // 30-70%
          disk: Math.floor(Math.random() * 20) + 15 // 15-35%
        },
        performance: {
          avgResponseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
          requestsPerMinute: Math.floor(Math.random() * 500) + 100, // 100-600 rpm
          errorRate: Math.random() * 2 // 0-2%
        },
        services: [
          {
            name: "Web Server",
            status: "running",
            lastCheck: new Date().toISOString()
          },
          {
            name: "Database",
            status: "running",
            lastCheck: new Date().toISOString()
          },
          {
            name: "File Storage",
            status: "running",
            lastCheck: new Date().toISOString()
          },
          {
            name: "Email Service",
            status: "running",
            lastCheck: new Date().toISOString()
          },
          {
            name: "Background Jobs",
            status: "running",
            lastCheck: new Date().toISOString()
          }
        ]
      };

      setSystemStats(mockStats);
    } catch (error) {
      console.error("Failed to fetch system stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "running":
        return "default";
      case "warning":
        return "secondary";
      case "error":
      case "stopped":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "running":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "error":
      case "stopped":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return "text-green-600";
    if (percentage < 80) return "text-yellow-600";
    return "text-red-600";
  };

  useEffect(() => {
    fetchSystemStats();
    const interval = setInterval(fetchSystemStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Monitor</h2>
          <p className="text-muted-foreground">Monitor system health and performance</p>
        </div>
        <Button onClick={fetchSystemStats} disabled={isLoading}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.uptime}</div>
            <p className="text-xs text-muted-foreground">
              Version {systemStats.version}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Environment</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{systemStats.environment}</div>
            <p className="text-xs text-muted-foreground">
              Current environment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.performance.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.performance.errorRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Current error rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUsageColor(systemStats.server.cpu)}`}>
              {systemStats.server.cpu}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${systemStats.server.cpu}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUsageColor(systemStats.server.memory)}`}>
              {systemStats.server.memory}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${systemStats.server.memory}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUsageColor(systemStats.server.disk)}`}>
              {systemStats.server.disk}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${systemStats.server.disk}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStats.database.status)}
              <span className="font-medium">Status:</span>
              <Badge variant={getStatusColor(systemStats.database.status)}>
                {systemStats.database.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">Connections:</span>
              <span>{systemStats.database.connections}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Size:</span>
              <span>{systemStats.database.size}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Services Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systemStats.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <span className="font-medium">{service.name}</span>
                </div>
                <Badge variant={getStatusColor(service.status)}>
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemStats.performance.requestsPerMinute}
              </div>
              <p className="text-sm text-muted-foreground">Requests/min</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {systemStats.performance.avgResponseTime}ms
              </div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {systemStats.performance.errorRate.toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground">Error Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
