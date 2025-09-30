"use client";

import Script from "next/script";
import { usePathname } from 'next/navigation'; 
import Navbar from "../components/Navbar";
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="ko">
      <head>
        <title>Grids & Circles</title>
        <meta name="description" content="작은 로컬 카페, Grids & Circles에서 매일 정성껏 로스팅한 원두를 만나보세요." />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body className="d-flex flex-column min-vh-100">
        <AuthProvider>
          <CartProvider>
            {!isAdminPage && <Navbar />}
            <main className={!isAdminPage ? "container py-4" : ""}>
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
      
        {!isAdminPage && (
          <footer className="text-center py-4 mt-auto bg-light">
            <small>&copy; 2025 Grids & Circles</small>
          </footer>
        )}

        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
