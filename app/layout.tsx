import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer"; // <--- Import Footer

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SimpleStats",
  description: "Privacy-friendly web analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* "min-h-screen flex flex-col" ensures footer stays at bottom */}
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        <Navbar />
        
        {/* "flex-1" pushes the footer down if content is short */}
        <main className="flex-1">
          {children}
        </main>
        
        <Footer /> 

        {/* YOUR TRACKER SCRIPT (For Dogfooding) */}
        {/* Make sure to keep your existing script here if you had one! */}
        <script 
          src="https://simple-stats-sandy.vercel.app/tracker.js" 
          data-website-id="YOUR_WEBSITE_ID_HERE" 
          async 
        />
      </body>
    </html>
  );
}