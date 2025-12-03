import { protectServer } from "@/features/auth/utils";
import { Wallet, Palette, Image as ImageIcon, Type } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function BrandPage() {
  await protectServer();

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marca</h1>
        <p className="text-gray-600 mt-1">Crie e gerencie coleções com sua marca</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Palette className="size-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Cores</CardTitle>
            </div>
            <CardDescription>
              Defina as cores da sua marca
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Gerenciar Cores
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Type className="size-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Fontes</CardTitle>
            </div>
            <CardDescription>
              Configure as fontes da sua marca
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Gerenciar Fontes
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <ImageIcon className="size-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Logos</CardTitle>
            </div>
            <CardDescription>
              Adicione logos da sua marca
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Gerenciar Logos
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Wallet className="size-6 text-purple-600" />
            <CardTitle>Coleções de Marca</CardTitle>
          </div>
          <CardDescription>
            Organize seus elementos de marca em coleções para usar rapidamente nos seus designs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Wallet className="size-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">Nenhuma coleção criada ainda</p>
            <Button className="mt-4" variant="outline">
              Criar Primeira Coleção
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

