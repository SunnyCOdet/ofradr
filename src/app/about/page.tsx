"use client";
import React, { useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import TextType from "../../components/TextType";
import { Inter, Big_Shoulders_Display } from "next/font/google";
import ASCIIText from "../../components/ASCIIText";
import { jersey10 } from "../../components/fonts";
import { ChevronUp, ChevronDown } from "lucide-react";

const bigShoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
})

function AboutContent() {
  const lenis = useLenis();
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToSection = (direction: 'up' | 'down') => {
    if (!lenis) return;

    const currentScroll = window.scrollY;
    
    // Get valid section positions
    const positions = sectionRefs.current
      .filter((ref): ref is HTMLDivElement => ref !== null)
      .map(ref => ref.offsetTop);

    let targetIndex = -1;
    const tolerance = 10; // px to account for minor offsets

    if (direction === 'down') {
      // Find the first section that starts *after* the current scroll position
      targetIndex = positions.findIndex(pos => pos > currentScroll + tolerance);
    } else {
      // Find the last section that starts *before* the current scroll position
      for (let i = positions.length - 1; i >= 0; i--) {
        if (positions[i] < currentScroll - tolerance) {
          targetIndex = i;
          break;
        }
      }
      // If we are slightly scrolled down in the first section, go back to top
      if (targetIndex === -1 && currentScroll > 0) {
        targetIndex = 0;
      }
    }

    if (targetIndex !== -1 && targetIndex < positions.length) {
      lenis.scrollTo(positions[targetIndex], { duration: 1.5 });
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden flex flex-col">
      {/* Navigation Buttons */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        <button 
          onClick={() => scrollToSection('up')}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white group"
          aria-label="Scroll Up"
        >
          <ChevronUp size={24} className="group-hover:-translate-y-0.5 transition-transform" />
        </button>
        <button 
          onClick={() => scrollToSection('down')}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white group"
          aria-label="Scroll Down"
        >
          <ChevronDown size={24} className="group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

      <div ref={(el) => { sectionRefs.current[0] = el; }} className="h-screen w-full flex items-center justify-center">
        <div className="relative w-full max-w-6xl h-[600px]">
          <ASCIIText 
            text="Ofradr" 
            enableWaves={true} 
            asciiFontSize={5} 
            textFontSize={300}
          />
        </div>
      </div>

      <div ref={(el) => { sectionRefs.current[1] = el; }} className="min-h-screen w-full flex items-center justify-center px-4">
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

      <div ref={(el) => { sectionRefs.current[2] = el; }} className="min-h-screen w-full flex items-center justify-center px-4">
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

      <div ref={(el) => { sectionRefs.current[3] = el; }} className="min-h-screen w-full flex items-center justify-center px-4">
        <div className="max-w-5xl w-full">
          <TextType 
            text={`Operating Modes

Coding Practice Mode
Ultra-stealth mode for coding assessments. Completely invisible operation with keyboard-only control.

Mock Interview Mode
Interactive mode for Mock interviews. Allows visible window interaction for custom questions.

AI Agent Mode
Leverages Google Gemini AI to analyse everything on the screen either via the screenshot or inspect functionality and solves the entire test on it own.`}
            className={`text-3xl md:text-5xl leading-relaxed text-neutral-200 block whitespace-pre-wrap ${jersey10.className}`}
            startOnVisible={true}
            loop={false}
            typingSpeed={20}
          />
        </div>
      </div>
    </div>
  );
}

export default function AboutOfradr() {
  return (
    <ReactLenis root>
      <AboutContent />
    </ReactLenis>
  );
}
