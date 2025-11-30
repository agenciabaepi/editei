import { 
  ActiveTool, 
  Editor, 
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Type, Heading1, Heading2, Heading3, AlignLeft, Quote, List, Hash } from "lucide-react";

interface TextSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const TextSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TextSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "text" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Text"
        description="Add text to your canvas"
      />
      <ScrollArea>
        <div className="p-4 space-y-1">
          {/* Basic Text Elements */}
          <div className="space-y-2 pb-4 border-b">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Basic Text</h3>
            <Button
              className="w-full justify-start h-12"
              variant="outline"
              onClick={() => editor?.addText("Textbox")}
            >
              <Type className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Textbox</div>
                <div className="text-xs text-gray-500">Simple text element</div>
              </div>
            </Button>
            <Button
              className="w-full justify-start h-12"
              variant="outline"
              onClick={() => editor?.addText("Paragraph", {
                fontSize: 32,
                fontFamily: "Inter",
              })}
            >
              <AlignLeft className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Paragraph</div>
                <div className="text-xs text-gray-500">Body text content</div>
              </div>
            </Button>
          </div>

          {/* Headings */}
          <div className="space-y-2 py-4 border-b">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Headings</h3>
            <Button
              className="w-full justify-start h-14"
              variant="outline"
              onClick={() => editor?.addText("Main Heading", {
                fontSize: 80,
                fontWeight: 700,
                fontFamily: "Inter",
              })}
            >
              <Heading1 className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="text-2xl font-bold">Main Heading</div>
                <div className="text-xs text-gray-500">Large title text</div>
              </div>
            </Button>
            <Button
              className="w-full justify-start h-12"
              variant="outline"
              onClick={() => editor?.addText("Subheading", {
                fontSize: 44,
                fontWeight: 600,
                fontFamily: "Inter",
              })}
            >
              <Heading2 className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="text-xl font-semibold">Subheading</div>
                <div className="text-xs text-gray-500">Section title</div>
              </div>
            </Button>
            <Button
              className="w-full justify-start h-12"
              variant="outline"
              onClick={() => editor?.addText("Small Heading", {
                fontSize: 36,
                fontWeight: 500,
                fontFamily: "Inter",
              })}
            >
              <Heading3 className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="text-lg font-medium">Small Heading</div>
                <div className="text-xs text-gray-500">Subsection title</div>
              </div>
            </Button>
          </div>

          {/* Special Text Types */}
          <div className="space-y-2 py-4 border-b">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Special Text</h3>
            <Button
              className="w-full justify-start h-12"
              variant="outline"
              onClick={() => editor?.addText('"Inspiring quote goes here"', {
                fontSize: 36,
                fontStyle: "italic",
                fontFamily: "Georgia",
                textAlign: "center",
              })}
            >
              <Quote className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="font-medium italic">Quote</div>
                <div className="text-xs text-gray-500">Inspirational text</div>
              </div>
            </Button>
            <Button
              className="w-full justify-start h-12"
              variant="outline"
              onClick={() => editor?.addText("• List item\n• List item\n• List item", {
                fontSize: 28,
                fontFamily: "Inter",
              })}
            >
              <List className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Bullet List</div>
                <div className="text-xs text-gray-500">Organized points</div>
              </div>
            </Button>
            <Button
              className="w-full justify-start h-12"
              variant="outline"
              onClick={() => editor?.addText("1. First item\n2. Second item\n3. Third item", {
                fontSize: 28,
                fontFamily: "Inter",
              })}
            >
              <Hash className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Numbered List</div>
                <div className="text-xs text-gray-500">Sequential steps</div>
              </div>
            </Button>
          </div>

          {/* Font Styles */}
          <div className="space-y-2 py-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Font Styles</h3>
            <Button
              className="w-full justify-start h-12"
              variant="outline"
              onClick={() => editor?.addText("Elegant Text", {
                fontSize: 40,
                fontFamily: "Playfair Display",
                fontWeight: 400,
              })}
            >
              <div className="text-left ml-7">
                <div className="font-serif text-lg">Elegant Text</div>
                <div className="text-xs text-gray-500">Playfair Display</div>
              </div>
            </Button>
            <Button
              className="w-full justify-start h-12"
              variant="outline"
              onClick={() => editor?.addText("Modern Text", {
                fontSize: 40,
                fontFamily: "Montserrat",
                fontWeight: 500,
              })}
            >
              <div className="text-left ml-7">
                <div className="font-sans text-lg font-medium">Modern Text</div>
                <div className="text-xs text-gray-500">Montserrat</div>
              </div>
            </Button>
            <Button
              className="w-full justify-start h-12"
              variant="outline"
              onClick={() => editor?.addText("Creative Text", {
                fontSize: 40,
                fontFamily: "Lobster",
                fontWeight: 400,
              })}
            >
              <div className="text-left ml-7">
                <div className="text-lg" style={{ fontFamily: 'cursive' }}>Creative Text</div>
                <div className="text-xs text-gray-500">Lobster</div>
              </div>
            </Button>
            <Button
              className="w-full justify-start h-12"
              variant="outline"
              onClick={() => editor?.addText("BOLD IMPACT", {
                fontSize: 48,
                fontFamily: "Oswald",
                fontWeight: 700,
              })}
            >
              <div className="text-left ml-7">
                <div className="text-lg font-bold uppercase">BOLD IMPACT</div>
                <div className="text-xs text-gray-500">Oswald</div>
              </div>
            </Button>
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
