import { protectServer } from "@/features/auth/utils";
import { ImageLibrary } from "./image-library";

export default async function ImagesPage() {
  await protectServer();

  return (
    <div className="flex flex-col space-y-6 max-w-screen-xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Images</h1>
          <p className="text-muted-foreground">Manage your uploaded images and media library</p>
        </div>
      </div>
      <ImageLibrary />
    </div>
  );
};
