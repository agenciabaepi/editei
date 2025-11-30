import { protectServer } from "@/features/auth/utils";
import { SettingsManager } from "./settings-manager";

export default async function SettingsPage() {
  await protectServer();

  return (
    <div className="flex flex-col space-y-6 max-w-screen-xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and application settings</p>
        </div>
      </div>
      <SettingsManager />
    </div>
  );
};
