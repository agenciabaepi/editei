"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const emojiCategories = {
  smileys: {
    name: "Smileys & People",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
      "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
      "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔",
      "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
      "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧",
      "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐"
    ]
  },
  animals: {
    name: "Animals & Nature",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
      "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒",
      "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇",
      "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜",
      "🦟", "🦗", "🕷", "🕸", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕",
      "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳"
    ]
  },
  food: {
    name: "Food & Drink",
    emojis: [
      "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈",
      "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦",
      "🥬", "🥒", "🌶", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔",
      "🍠", "🥐", "🥖", "🍞", "🥨", "🥯", "🧀", "🥚", "🍳", "🧈",
      "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟",
      "🍕", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🥘", "🫕"
    ]
  },
  activities: {
    name: "Activities",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
      "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳",
      "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸",
      "🥌", "🎿", "⛷", "🏂", "🪂", "🏋", "🤼", "🤸", "⛹", "🤺",
      "🏇", "🧘", "🏄", "🏊", "🤽", "🚣", "🧗", "🚵", "🚴", "🏆",
      "🥇", "🥈", "🥉", "🏅", "🎖", "🏵", "🎗", "🎫", "🎟", "🎪"
    ]
  },
  travel: {
    name: "Travel & Places",
    emojis: [
      "🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐",
      "🛻", "🚚", "🚛", "🚜", "🏍", "🛵", "🚲", "🛴", "🛹", "🛼",
      "🚁", "🛸", "✈", "🛩", "🛫", "🛬", "🪂", "💺", "🚀", "🛰",
      "🚢", "⛵", "🚤", "🛥", "🛳", "⛴", "🚂", "🚃", "🚄", "🚅",
      "🚆", "🚇", "🚈", "🚉", "🚊", "🚝", "🚞", "🚋", "🚌", "🚍",
      "🎡", "🎢", "🎠", "🏗", "🌁", "🗼", "🏭", "⛲", "🎑", "⛰"
    ]
  },
  objects: {
    name: "Objects",
    emojis: [
      "⌚", "📱", "📲", "💻", "⌨", "🖥", "🖨", "🖱", "🖲", "🕹",
      "🗜", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥",
      "📽", "🎞", "📞", "☎", "📟", "📠", "📺", "📻", "🎙", "🎚",
      "🎛", "🧭", "⏱", "⏲", "⏰", "🕰", "⌛", "⏳", "📡", "🔋",
      "🔌", "💡", "🔦", "🕯", "🪔", "🧯", "🛢", "💸", "💵", "💴",
      "💶", "💷", "🪙", "💰", "💳", "💎", "⚖", "🪜", "🧰", "🔧"
    ]
  },
  symbols: {
    name: "Symbols",
    emojis: [
      "❤", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮",
      "✝", "☪", "🕉", "☸", "✡", "🔯", "🕎", "☯", "☦", "🛐",
      "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐",
      "♑", "♒", "♓", "🆔", "⚛", "🉑", "☢", "☣", "📴", "📳",
      "🈶", "🈚", "🈸", "🈺", "🈷", "✴", "🆚", "💮", "🉐", "㊙"
    ]
  }
};

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState("smileys");

  return (
    <div className="w-full">
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="smileys" className="text-xs">😀</TabsTrigger>
          <TabsTrigger value="animals" className="text-xs">🐶</TabsTrigger>
          <TabsTrigger value="food" className="text-xs">🍎</TabsTrigger>
          <TabsTrigger value="activities" className="text-xs">⚽</TabsTrigger>
          <TabsTrigger value="travel" className="text-xs">🚗</TabsTrigger>
          <TabsTrigger value="objects" className="text-xs">📱</TabsTrigger>
        </TabsList>
        
        {Object.entries(emojiCategories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="mt-2">
            <ScrollArea className="h-48">
              <div className="grid grid-cols-8 gap-1 p-2">
                {category.emojis.map((emoji, index) => (
                  <Button
                    key={`${key}-${index}`}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg hover:bg-muted"
                    onClick={() => onEmojiSelect(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
