import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";

import MainLayout from "@/app/MainLayout";
import { AuthProvider } from "@/context/AuthContext";
import { AccountBookProvider } from "@/context/AccountBookContext";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "記帳小精靈",
  description: "多人記帳網站",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSansTC.variable} font-sans`}>
        <AuthProvider>
          <AccountBookProvider>
            <MainLayout>{children}</MainLayout>
          </AccountBookProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
