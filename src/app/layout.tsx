import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import { Inter,Big_Shoulders_Display } from "next/font/google";
import "./globals.css";
import GlobalBackground from "../components/GlobalBackground";

const inter = Inter({ subsets: ["latin"] });
const bigShoulders = Big_Shoulders_Display({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})
export const metadata: Metadata = {
  title: "Ofradr",
  description: "Ofradr is a stealthy AI-powered code assistant designed for coding practices and interview helper. It operates in two intelligent modes—Coding Practice Mode and Mock Interview Mode—providing real-time code generation or concept assistance. With built-in invisibility features, it remains undetectable during proctored or shared sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* SVG Filter for Liquid Glass Effect */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency="0.012 0.012"
                numOctaves="2" 
                seed="92" 
                result="noise" 
              />
              <feGaussianBlur 
                in="noise" 
                stdDeviation="2" 
                result="blurred" 
              />
              <feDisplacementMap 
                in="SourceGraphic" 
                in2="blurred" 
                scale="85"
                xChannelSelector="R" 
                yChannelSelector="G" 
              />
            </filter>
          </defs>
        </svg>
        <GlobalBackground />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
