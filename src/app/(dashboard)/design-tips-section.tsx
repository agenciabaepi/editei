"use client";

import { useState } from "react";
import { 
  Lightbulb, 
  Palette, 
  Type, 
  Layout, 
  ChevronRight
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DESIGN_TIPS = [
  {
    id: 1,
    title: "Use a Regra dos Terços",
    description: "Divida seu design em terços tanto horizontal quanto verticalmente para uma melhor composição",
    category: "Layout",
    icon: Layout,
    color: "bg-blue-500",
    isNew: false
  },
  {
    id: 2,
    title: "Limite Sua Paleta de Cores",
    description: "Mantenha 2-3 cores principais para criar um visual coeso e profissional",
    category: "Cor",
    icon: Palette,
    color: "bg-pink-500",
    isNew: true
  },
  {
    id: 3,
    title: "Hierarquia Tipográfica",
    description: "Use diferentes tamanhos e pesos de fonte para guiar o olhar do leitor pelo seu conteúdo",
    category: "Tipografia",
    icon: Type,
    color: "bg-green-500",
    isNew: false
  }
];


export const DesignTipsSection = () => {
  const [currentTip, setCurrentTip] = useState(0);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % DESIGN_TIPS.length);
  };

  const currentTipData = DESIGN_TIPS[currentTip];
  const IconComponent = currentTipData.icon;

  return (
    <div className="space-y-6">
      {/* Design Tip of the Day */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              Dica de Design do Dia
              {currentTipData.isNew && (
                <Badge variant="secondary" className="ml-2 text-xs">Novo</Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={nextTip}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 ${currentTipData.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-2">{currentTipData.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{currentTipData.description}</p>
              <Badge variant="outline" className="text-xs">
                {currentTipData.category}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
