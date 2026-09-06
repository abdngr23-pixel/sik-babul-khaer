import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { ConfirmProvider } from "@/lib/confirm-context";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIK-MBH | Sistem Informasi DKM Babul Khaer",
  description: "Sistem Informasi & Administrasi DKM Masjid Babul Khaer, BTP Blok AE, Tamalanrea, Makassar",
  icons: {
    icon: "/logo-babul-khaer.png",
    shortcut: "/logo-babul-khaer.png",
    apple: "/logo-babul-khaer.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] text-[#0F172A]">
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>{children}</ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
