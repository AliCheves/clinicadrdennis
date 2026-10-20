import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Consultorio",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-SV">
      <body>{children}</body>
    </html>
  );
}
