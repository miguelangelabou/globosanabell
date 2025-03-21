import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { getDocuments } from "../utils/Database";
import Company from "../interfaces/Company"

const company = (await getDocuments("company") as Company[])[0];

export const metadata: Metadata = {
  title: company.name,
  description: company.description,
  icons: company.logoURL
};

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
