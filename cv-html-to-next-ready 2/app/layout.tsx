import type { Metadata } from "next";
import GA from "@/components/GA";
import "./../styles/royal-sapphire.css";

export const metadata: Metadata = {
  title: "José Luis Acevedo Ayala · Ingeniero Comercial",
  description: "CV y contacto de José Luis Acevedo Ayala.",
  themeColor: "#0b1321"
};

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="es">
      <body>
        <GA />
        {children}
      </body>
    </html>
  );
}