import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import { Inter,Big_Shoulders_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const bigShoulders = Big_Shoulders_Display({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})
export const metadata: Metadata = {
  title: "MonkeyCoder",
  description: "Ofradr is a stealthy AI-powered code assistant designed for coding practices and interview helper. It operates in two intelligent modes—Coding Practice Mode and Mock Interview Mode—providing real-time code generation or concept assistance. With built-in invisibility features, it remains undetectable during proctored or shared sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}
      <Analytics />
      </body>
    </html>
  );
}
