import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { CompanyProvider } from "../contexts/CompanyContext";
import { getDocuments } from '../utils/Utils';
import type Company from "../interfaces/Company";

const defaultMetadata = {
  title: "Globos Anabell",
  description: "...",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const companies = await getDocuments("company") as Company[];
    const company = companies && companies.length > 0 ? companies[0] : null;
    return {
      title: company?.name || defaultMetadata.title,
      description: company?.description || defaultMetadata.description,
      icons: company?.logoURL || "",
    };
  } catch (error) {
    console.error("Error fetching company metadata:", error);
    return defaultMetadata;
  }
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