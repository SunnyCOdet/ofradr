"use client";
import React from "react";
import { ReactLenis } from "lenis/react";
import TextType from "../../components/TextType";
import { Footer } from "../experiment/Footer";
import { Inter, Big_Shoulders_Display } from "next/font/google";
import ASCIIText from "../../components/ASCIIText";
import { jersey10 } from "../../components/fonts";

const bigShoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
})

export default function AboutOfradr() {
  return (
    <ReactLenis root>
      <div className="relative min-h-screen text-white overflow-x-hidden flex flex-col">
        <div className="h-screen w-full flex items-center justify-center">
          <div className="relative w-full max-w-6xl h-[600px]">
            <ASCIIText 
              text="Ofradr" 
              enableWaves={true} 
              asciiFontSize={5} 
              textFontSize={300}
            />
          </div>
        </div>
        <div className="min-h-screen w-full flex items-center justify-center px-4">
          <div className="max-w-5xl w-full">
            <TextType 
              text="Ofradr is an AI-powered coding companion that runs off-radar during your coding practice and mock interviews. It reads problems directly from screenshots and uses Google Gemini AI to generate solutions, explanations, refactors, and more—without interrupting your flow or cluttering your screen."
              className={`text-3xl md:text-5xl leading-relaxed text-neutral-200 block ${jersey10.className}`}
              startOnVisible={true}
              loop={false}
              typingSpeed={20}
            />
          </div>
        </div>
        <div className="min-h-screen w-full flex items-center justify-center px-4">
          <div className="max-w-5xl w-full">
            <TextType 
              text={`Key Features

1. Stealth Mode
Operates completely invisibly in the background. No visible windows or indicators during operation.

2. Keyboard Shortcuts
Control everything with simple keyboard combinations. Alt+S for screenshots, Ctrl+Enter to send.

3. AI-Powered
Leverages Google Gemini AI to analyze coding problems and provide intelligent solutions.`}
              className={`text-3xl md:text-5xl leading-relaxed text-neutral-200 block whitespace-pre-wrap ${jersey10.className}`}
              startOnVisible={true}
              loop={false}
              typingSpeed={20}
            />
          </div>
        </div>
     
      </div>
    </ReactLenis>
  );
}
