import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editei",
  description: "Crie designs incríveis em minutos!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
