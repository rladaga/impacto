import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Impacto",
  description: "Un espacio que amplifica, una herramienta que conecta.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Blocking, inline and deliberately before any other script: it must run
            before the first paint. The home page ships the splash in its server
            HTML, which the browser paints long before React hydrates — so React
            alone cannot avoid a flash of the globe for visitors who already
            entered this session. This marks the document instead, and the rule in
            globals.css hides the splash from the very first frame. Client-side
            navigations back to `/` don't re-run this; the layout effect in
            app/page.tsx covers those (no server paint happens there). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("impacto:splash-seen"))document.documentElement.dataset.splashSeen="1"}catch(e){}`,
          }}
        />
        <script src="//cdn.jsdelivr.net/npm/globe.gl" async defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
