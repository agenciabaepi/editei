import { IoTriangle } from "react-icons/io5";
import { FaDiamond } from "react-icons/fa6";
import { FaCircle, FaSquare, FaSquareFull, FaHeart, FaStar, FaArrowRight, FaArrowUp, FaArrowDown, FaArrowLeft } from "react-icons/fa";
import { BsHexagon, BsPentagon, BsOctagon, BsLightning, BsCloud, BsSun, BsMoon } from "react-icons/bs";
import { TbChartBar, TbChartPie, TbChartLine, TbChartDonut, TbMessageCircle, TbShield } from "react-icons/tb";
import { RiFlowerFill, RiLeafFill } from "react-icons/ri";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ShapeTool } from "@/features/editor/components/shape-tool";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EmojiPicker } from "@/components/emoji-picker";

interface ShapeSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const ShapeSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ShapeSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "shapes" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Shapes & Charts"
        description="Add shapes, charts, and elements to your canvas"
      />
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="arrows">Arrows</TabsTrigger>
              <TabsTrigger value="nature">Nature</TabsTrigger>
              <TabsTrigger value="emojis">😀</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Basic Shapes</Label>
                <div className="grid grid-cols-3 gap-3">
                  <ShapeTool onClick={() => editor?.addCircle()} icon={FaCircle} />
                  <ShapeTool onClick={() => editor?.addSoftRectangle()} icon={FaSquare} />
                  <ShapeTool onClick={() => editor?.addRectangle()} icon={FaSquareFull} />
                  <ShapeTool onClick={() => editor?.addTriangle()} icon={IoTriangle} />
                  <ShapeTool onClick={() => editor?.addInverseTriangle()} icon={IoTriangle} iconClassName="rotate-180" />
                  <ShapeTool onClick={() => editor?.addDiamond()} icon={FaDiamond} />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Polygons</Label>
                <div className="grid grid-cols-3 gap-3">
                  <ShapeTool onClick={() => editor?.addHexagon?.()} icon={BsHexagon} />
                  <ShapeTool onClick={() => editor?.addPentagon?.()} icon={BsPentagon} />
                  <ShapeTool onClick={() => editor?.addOctagon?.()} icon={BsOctagon} />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Special Shapes</Label>
                <div className="grid grid-cols-3 gap-3">
                  <ShapeTool onClick={() => editor?.addHeart?.()} icon={FaHeart} />
                  <ShapeTool onClick={() => editor?.addStar?.()} icon={FaStar} />
                  <ShapeTool onClick={() => editor?.addShield?.()} icon={TbShield} />
                  <ShapeTool onClick={() => editor?.addSpeechBubble?.()} icon={TbMessageCircle} />
                  <ShapeTool onClick={() => editor?.addLightning?.()} icon={BsLightning} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="charts" className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Data Charts</Label>
                <div className="grid grid-cols-2 gap-3">
                  <ShapeTool onClick={() => editor?.addBarChart?.()} icon={TbChartBar} />
                  <ShapeTool onClick={() => editor?.addPieChart?.()} icon={TbChartPie} />
                  <ShapeTool onClick={() => editor?.addLineChart?.()} icon={TbChartLine} />
                  <ShapeTool onClick={() => editor?.addDonutChart?.()} icon={TbChartDonut} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="arrows" className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Direction Arrows</Label>
                <div className="grid grid-cols-2 gap-3">
                  <ShapeTool onClick={() => editor?.addArrowRight?.()} icon={FaArrowRight} />
                  <ShapeTool onClick={() => editor?.addArrowLeft?.()} icon={FaArrowLeft} />
                  <ShapeTool onClick={() => editor?.addArrowUp?.()} icon={FaArrowUp} />
                  <ShapeTool onClick={() => editor?.addArrowDown?.()} icon={FaArrowDown} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nature" className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Nature & Weather</Label>
                <div className="grid grid-cols-3 gap-3">
                  <ShapeTool onClick={() => editor?.addSun?.()} icon={BsSun} />
                  <ShapeTool onClick={() => editor?.addMoon?.()} icon={BsMoon} />
                  <ShapeTool onClick={() => editor?.addCloud?.()} icon={BsCloud} />
                  <ShapeTool onClick={() => editor?.addFlower?.()} icon={RiFlowerFill} />
                  <ShapeTool onClick={() => editor?.addLeaf?.()} icon={RiLeafFill} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="emojis" className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Emojis</Label>
                <EmojiPicker onEmojiSelect={(emoji) => editor?.addEmoji?.(emoji)} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={() => onChangeActiveTool("select")} />
    </aside>
  );
};
