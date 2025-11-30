"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  CreditCard, 
  Search,
  ExternalLink,
  Calendar,
  DollarSign,
  Plus,
  User
} from "lucide-react";
import { toast } from "sonner";

interface Subscription {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  stripe_current_period_end: string;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    user_id: "",
    plan: "monthly",
    status: "active"
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    canceled: 0,
    monthlyRevenue: 0
  });

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/subscriptions");
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions);
        setFilteredSubscriptions(data.subscriptions);
        
        // Calculate stats
        const total = data.subscriptions.length;
        const active = data.subscriptions.filter((s: Subscription) => s.status === 'active').length;
        const canceled = data.subscriptions.filter((s: Subscription) => s.status === 'canceled').length;
        const monthlyRevenue = active * 10; // Assuming $10/month subscription
        
        setStats({ total, active, canceled, monthlyRevenue });
      }
    } catch (error) {
      toast.error("Failed to fetch subscriptions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = subscriptions.filter(subscription => 
      subscription.user_name?.toLowerCase().includes(term.toLowerCase()) ||
      subscription.user_email.toLowerCase().includes(term.toLowerCase()) ||
      subscription.stripe_subscription_id.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredSubscriptions(filtered);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleCreateSubscription = async () => {
    if (!newSubscription.user_id) {
      toast.error("Please select a user");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSubscription),
      });

      if (response.ok) {
        toast.success("Subscription created successfully");
        setShowAddDialog(false);
        setNewSubscription({
          user_id: "",
          plan: "monthly",
          status: "active"
        });
        fetchSubscriptions();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create subscription");
      }
    } catch (error) {
      toast.error("Failed to create subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'canceled':
        return 'destructive';
      case 'past_due':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchUsers();
  }, []);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscription Management</h2>
          <p className="text-muted-foreground">Monitor and manage user subscriptions</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subscription
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Subscription</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user">Select User</Label>
                <Select value={newSubscription.user_id} onValueChange={(value) => setNewSubscription({ ...newSubscription, user_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="plan">Subscription Plan</Label>
                <Select value={newSubscription.plan} onValueChange={(value) => setNewSubscription({ ...newSubscription, plan: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly ($10/month)</SelectItem>
                    <SelectItem value="yearly">Yearly ($100/year)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Initial Status</Label>
                <Select value={newSubscription.status} onValueChange={(value) => setNewSubscription({ ...newSubscription, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateSubscription} className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Subscription"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently paying customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceled</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.canceled}</div>
            <p className="text-xs text-muted-foreground">
              Canceled subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.monthlyRevenue}</div>
            <p className="text-xs text-muted-foreground">
              Estimated monthly recurring revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            All Subscriptions ({filteredSubscriptions.length})
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or subscription ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription ID</TableHead>
                <TableHead>Current Period End</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">
                    {subscription.user_name || "No name"}
                  </TableCell>
                  <TableCell>{subscription.user_email}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(subscription.status)}>
                      {subscription.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {subscription.stripe_subscription_id}
                  </TableCell>
                  <TableCell>
                    {subscription.stripe_current_period_end 
                      ? new Date(subscription.stripe_current_period_end).toLocaleDateString()
                      : "N/A"
                    }
                  </TableCell>
                  <TableCell>
                    {new Date(subscription.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://dashboard.stripe.com/subscriptions/${subscription.stripe_subscription_id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
