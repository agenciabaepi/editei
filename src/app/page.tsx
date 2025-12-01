import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Editei</h1>
      <p style={{ marginBottom: '2rem' }}>Bem-vindo ao Editei - Crie designs incríveis em minutos!</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/sign-in">
          <Button>Entrar</Button>
        </Link>
        <Link href="/sign-up">
          <Button variant="outline">Criar Conta</Button>
        </Link>
      </div>
    </div>
  );
}
