"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail, Lock, User, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AddUserPage() {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "admin"
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newUser.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        toast.success("User created successfully");
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "user"
        });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create user");
      }
    } catch (error) {
      toast.error("Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser({ ...newUser, password });
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New User</h2>
          <p className="text-muted-foreground">Create a new user account or admin</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Add User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create User Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePassword}
                  className="whitespace-nowrap"
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 6 characters long
              </p>
            </div>
            <div>
              <Label htmlFor="role" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                User Role
              </Label>
              <Select value={newUser.role} onValueChange={(value: string) => setNewUser({ ...newUser, role: value as "user" | "admin" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateUser} className="w-full" disabled={isLoading}>
              {isLoading ? "Creating User..." : "Create User"}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>User Creation Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm">User Roles</h4>
              <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                <li>• <strong>User:</strong> Can create and edit their own projects</li>
                <li>• <strong>Admin:</strong> Full access to admin dashboard and user management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm">Password Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                <li>• Minimum 6 characters</li>
                <li>• Use the &quot;Generate&quot; button for secure passwords</li>
                <li>• Share credentials securely with the new user</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm">Email Verification</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Users will need to verify their email address before they can access all features.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Admin Privileges</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Admin users can access the admin dashboard at <code>/admin</code> and manage all users, subscriptions, and templates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setNewUser({ ...newUser, role: "user" })}
            >
              Create Regular User
            </Button>
            <Button
              variant="outline"
              onClick={() => setNewUser({ ...newUser, role: "admin" })}
            >
              Create Admin User
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("/admin/users", "_blank")}
            >
              View All Users
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
