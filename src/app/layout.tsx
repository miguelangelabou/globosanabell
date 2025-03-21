// app/layout.tsx (Componente de servidor)
import type { Metadata } from "next";
import "../styles/globals.css";
import { getDocuments } from "../utils/Database";
import { AuthProvider } from "../contexts/AuthContext";

export async function generateMetadata(): Promise<Metadata> {
  const companies = (await getDocuments("company")) as any[];
  const company = companies[0];
  return {
    title: company?.name || "...",
    description: company?.description || "...",
    icons: company?.logoURL || "",
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
