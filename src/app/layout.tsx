// app/layout.tsx
import type { Metadata } from "next";
import "../styles/globals.css";
import { getDocuments } from "../utils/Database";
import { AuthProvider } from "../contexts/AuthContext";
import { CompanyProvider } from "../contexts/CompanyContext";

export async function generateMetadata(): Promise<Metadata> {
  const companies = (await getDocuments("company")) as any[];
  const company = companies[0];
  return {
    title: company?.name || "Globos Anabell",
    description: company?.description || "...",
    icons: company?.logoURL || "",
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <CompanyProvider>
            {children}
          </CompanyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}