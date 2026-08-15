import type { Metadata } from "next";
import { Fira_Code, Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AnimatedBackground } from "@/components/common/animated-background";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CodeNight N3 - Go Session",
  description:
    "A hands-on Go workshop by the Mozilla Campus Club of SLIIT: six chapters, thirty-one lessons, three tasks each.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark",
        "h-full",
        "antialiased",
        "font-sans",
        inter.variable,
        poppins.variable,
        firaCode.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}
