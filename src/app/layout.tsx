import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { CompanyProvider } from "../contexts/CompanyContext";
import { getDocuments } from "../utils/Utils";
import type Company from "../interfaces/Company";
import Script from "next/script";

const defaultMetadata = {
  title: "Globos Anabell",
  icons: "https://i.imgur.com/KM3MVbw.png",
  description:
    "En Globos Anabell, transformamos tus celebraciones en momentos inolvidables. Ofrecemos una amplia variedad de productos para fechas especiales, cumpleaños, bodas y eventos, incluyendo regalos únicos, detalles personalizados, peluches, flores, ramos, globos, joyería, juguetes y dulces. Con nuestros arreglos florales, centros de mesa y cestas de regalo, cada ocasión se convierte en una experiencia mágica. ¡Celebra con nosotros y haz que cada evento sea especial!",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const companies = (await getDocuments("company")) as Company[];
    const company = companies && companies.length > 0 ? companies[0] : null;
    const title = company?.name || defaultMetadata.title;
    const description = company?.description || defaultMetadata.description;

    return {
      title,
      description,
      icons: company?.logoURL || "",
      openGraph: {
        title,
        description,
        url: "https://globosanabell.vercel.app",
        images: [
          {
            url: company?.logoURL || "https://i.imgur.com/KM3MVbw.png",
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [company?.logoURL || "https://i.imgur.com/KM3MVbw.png"],
      },
      alternates: {
        canonical: "https://globosanabell.vercel.app",
      },
    };
  } catch (error) {
    console.error("Error fetching company metadata:", error);
    return defaultMetadata;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtenemos los datos de la empresa
  const companies = (await getDocuments("company")) as Company[];
  const company = companies && companies.length > 0 ? companies[0] : null;

  return (
    <html lang="es">
      <head>
        <Script id="json-ld-organization" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": company?.name || "Globos Anabell",
            "url": "https://globosanabell.vercel.app",
            "logo": company?.logoURL || "https://i.imgur.com/KM3MVbw.png",
            "description":
              company?.description ||
              "En Globos Anabell, transformamos tus celebraciones en momentos inolvidables. Ofrecemos una amplia variedad de productos para fechas especiales, cumpleaños, bodas y eventos, incluyendo regalos únicos, detalles personalizados, peluches, flores, ramos, globos, joyería, juguetes y dulces. Con nuestros arreglos florales, centros de mesa y cestas de regalo, cada ocasión se convierte en una experiencia mágica. ¡Celebra con nosotros y haz que cada evento sea especial!",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": company?.phone || "+34679380511",
              "contactType": "customer service",
            },
          })}
        </Script>
      </head>
      <body>
        <AuthProvider>
          <CompanyProvider>{children}</CompanyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
