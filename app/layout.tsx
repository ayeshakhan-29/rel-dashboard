import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";


export const metadata: Metadata = {
  title: "CRM - Authentication System",
  description: "Full-stack CRM application with authentication and authorization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
