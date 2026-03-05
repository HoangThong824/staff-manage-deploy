import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/DashboardShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StaffMNG | HR Management System",
  description: "Modern Human Resource Management System built with Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  let isManager = false;
  if (session?.user?.employeeId) {
    const { db } = await import("@/lib/db");
    const subordinates = await db.employee.getSubordinates(session.user.employeeId);
    isManager = subordinates.length > 0;
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <DashboardShell user={{ ...session?.user, isManager } as any}>
          {children}
        </DashboardShell>
      </body>
    </html>
  );
}
