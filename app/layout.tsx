import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ModalPorvider from "@/Providers/modalPorvider";
import { ToastProvider } from "@/Providers/toastProvider";
import { ThemeProvider } from "@/Providers/themeProvider";
import { ClerkProvider } from "@clerk/nextjs";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Portal",
  description: "Admin Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ModalPorvider />
            <ToastProvider />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
