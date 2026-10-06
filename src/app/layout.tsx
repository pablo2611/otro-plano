import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Otro Plano® — Mundos que todavía no existen",
  description:
    "Estudio independiente de diseño creativo, código experimental y experiencias digitales inmersivas. Hagamos lugar para lo improbable.",
  applicationName: "Otro Plano®",
  openGraph: {
    title: "Otro Plano® — Mundos que todavía no existen",
    description:
      "Diseño, código y experiencias digitales para torcer la forma de lo real.",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
