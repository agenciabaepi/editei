import { protectServer } from "@/features/auth/utils";
import { TrashManager } from "./trash-manager";

export default async function TrashPage() {
  await protectServer();

  return (
    <div className="flex flex-col space-y-6 max-w-screen-xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trash</h1>
          <p className="text-muted-foreground">Recover or permanently delete your projects</p>
        </div>
      </div>
      <TrashManager />
    </div>
  );
};
