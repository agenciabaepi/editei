import { useState } from "react";

import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { useGenerateImage } from "@/features/ai/api/use-generate-image";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "lucide-react";

interface AiSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const AiSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: AiSidebarProps) => {
  const { shouldBlock, triggerPaywall } = usePaywall();
  const mutation = useGenerateImage();

  const [value, setValue] = useState("");

  const onSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (shouldBlock) {
      triggerPaywall();
      return;
    }

    mutation.mutate({ prompt: value }, {
      onSuccess: (response) => {
        const data = 'data' in response ? response.data : response;
        if (typeof data === 'string') {
          editor?.addImage(data);
          setValue(""); // Clear the input after successful generation
          toast.success("Image generated successfully!");
        } else {
          toast.error("Invalid response format");
        }
      },
      onError: (error) => {
        console.error("AI generation failed:", error);
        toast.error(error.message || "Failed to generate image");
      }
    });
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "ai" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="AI"
        description="Generate an image using AI"
      />
      <ScrollArea>
        <form onSubmit={onSubmit} className="p-4 space-y-6">
          <Textarea
            disabled={mutation.isPending}
            placeholder="An astronaut riding a horse on mars, hd, dramatic lighting"
            cols={30}
            rows={10}
            required
            minLength={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          
          {mutation.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">
                {mutation.error.message}
              </p>
              {mutation.error.message.includes("credits exhausted") && (
                <p className="text-xs text-red-500 mt-1">
                  Visit <a href="https://replicate.com/account/billing" target="_blank" rel="noopener noreferrer" className="underline">Replicate Billing</a> to add credits.
                </p>
              )}
            </div>
          )}
          
          <Button
            disabled={mutation.isPending || !value.trim()}
            type="submit"
            className="w-full"
          >
            {mutation.isPending ? (
              <>
                <Loader className="size-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </form>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
