"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, TriangleAlert, Mail, Lock, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const CustomSignInCard = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use window.location.origin to ensure we use the correct port
      const apiUrl = `${window.location.origin}/api/auth/login`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Force complete page reload
        window.location.replace('/dashboard');
      } else {
        // Translate error messages to Portuguese
        const errorMessage = data.error || 'Falha no login';
        let translatedError = errorMessage;
        
        if (errorMessage.includes('Invalid credentials')) {
          translatedError = 'Credenciais inválidas. Verifique seu email e senha.';
        } else if (errorMessage.includes('social login')) {
          translatedError = 'Esta conta foi criada com login social. Use o mesmo método para entrar.';
        } else if (errorMessage.includes('User already exists')) {
          translatedError = 'Este usuário já existe.';
        }
        
        setError(translatedError);
      }
    } catch (error) {
        setError('Ocorreu um erro durante o login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Bem-vindo de volta</CardTitle>
        <CardDescription className="text-gray-600">
          Entre na sua conta para continuar criando designs incríveis
        </CardDescription>
      </CardHeader>

      {error && (
        <div className="mx-6 mb-6 bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-x-2 text-sm text-red-600">
          <TriangleAlert className="size-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <CardContent className="space-y-6 px-6 pb-6">

        {/* Email/Password Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Endereço de email
            </label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              type="email"
              disabled={loading}
              required
              className="h-12"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Senha
            </label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              type="password"
              disabled={loading}
              required
              className="h-12"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Lembrar-me
              </label>
            </div>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
              Esqueceu a senha?
            </Link>
          </div>

          <Button 
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 size-5 animate-spin" />
            ) : (
              <>
                <Lock className="mr-2 size-5" />
                Entrar
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{" "}
            <Link href="/sign-up" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
