"use client";
import React, { useRef, useEffect, useState } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { Big_Shoulders_Display } from "next/font/google";
import { ChevronUp, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { jersey10 } from "../../components/fonts";
import Plasma from "../../components/Plasma";
import TextType from "../../components/TextType";

const bigShoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
})

const usageSteps = [
  {
    title: "1. Log In to Your Account",
    content: "Sign in using your Ofradr ID and password to access your workspace."
  },
  {
    title: "2. Open the Settings Menu",
    content: "After logging in, navigate to Settings where you can view and customize how your shortcuts work."
  },
  {
    title: "3. Review Your Shortcut Mode",
    content: `Ofradr offers two shortcut styles. Check which one is active by default:

Classic Mode
ALT + H → Hide
ALT + S → Screenshot

Modern Mode
ALT + \\ → Hide
ALT + / → Screenshot

Universal Shortcuts
ALT + P → Send custom prompt
ALT + T → Type
ALT + V → Paste`
  },
  {
    title: "4. Confirm and Adjust Controls",
    content: "Verify that your controls match your preferences. Change them if needed to ensure easy workflow before you begin."
  },
  {
    title: "5. Choose Your Work Mode",
    content: `Select how you want to use Ofradr:

Coding Practice
Manually take screenshots or use the Inspect → Send button to upload coding questions.

Ofradr Agent
Automatically completes tasks and assignments for you using the agent.`
  }
];

function UsageContent() {
  const lenis = useLenis();
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Animation for the title moving from center to left
  const titleX = useTransform(scrollYProgress, [0, 0.1], ["50%", "35%"]);
  const titleXPercent = useTransform(scrollYProgress, [0, 0.1], ["-50%", "-50%"]);
  const titleScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.6]);
  const titleTop = useTransform(scrollYProgress, [0, 0.1], ["50%", "55%"]);
  const titleYPercent = useTransform(scrollYProgress, [0, 0.1], ["-50%", "-50%"]);

  const scrollToSection = (direction: 'up' | 'down') => {
    if (!lenis) return;

    const currentScroll = window.scrollY;
    
    // Get valid section positions
    // We add the Hero section (top of page) as index -1 effectively
    const positions = [0, ...sectionRefs.current
      .filter((ref): ref is HTMLDivElement => ref !== null)
      .map(ref => ref.offsetTop)];

    let targetIndex = -1;
    const tolerance = 50; 

    if (direction === 'down') {
      targetIndex = positions.findIndex(pos => pos > currentScroll + tolerance);
    } else {
      for (let i = positions.length - 1; i >= 0; i--) {
        if (positions[i] < currentScroll - tolerance) {
          targetIndex = i;
          break;
        }
      }
    }

    if (targetIndex !== -1 && targetIndex < positions.length) {
      lenis.scrollTo(positions[targetIndex], { duration: 1.5 });
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen text-white overflow-x-hidden flex flex-col bg-transparent">
       <div className="fixed inset-0 -z-20 bg-black" />
       <div className="fixed inset-0 -z-10">
        <Plasma 
          color="#ea3a59"
          speed={1.5}
          direction="forward"
          scale={1.5}
          opacity={0.8}
          mouseInteractive={true}
        />
      </div>

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

      {/* Sticky Title */}
      <motion.div 
        className="fixed left-0 z-40 pointer-events-none w-full md:w-auto px-8 md:px-16"
        style={{ 
          top: titleTop,
          left: titleX,
          x: titleXPercent,
          y: titleYPercent,
          scale: titleScale,
          transformOrigin: "left top"
        }}
      >
        <h1 className={`text-8xl md:text-[12rem] font-black leading-none ${bigShoulders.className}`}>
          USAGE
        </h1>
        <TextType 
            text="How to use Ofradr..."
            className={`text-3xl md:text-5xl leading-relaxed text-neutral-200 block ${jersey10.className}`}
            startOnVisible={true}
            loop={false}
            typingSpeed={20}
          />
      </motion.div>

      {/* Spacer for initial hero view */}
      <div className="h-screen w-full" />

      {/* Content Steps */}
      <div className="w-full flex flex-col items-end px-4 md:px-16 pb-32">
        <div className="w-full md:w-1/2 flex flex-col gap-32">
          {usageSteps.map((step, index) => (
            <div 
              key={index} 
              ref={(el) => { sectionRefs.current[index] = el; }}
              className="min-h-screen flex flex-col justify-center"
            >
              <h2 className={`text-4xl md:text-5xl mb-6 text-red-500 ${jersey10.className}`}>
                {step.title}
              </h2>
              <div className={`text-2xl md:text-3xl leading-relaxed text-neutral-200 whitespace-pre-wrap ${jersey10.className}`}>
                {step.content}
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}

export default function UsagePage() {
  return (
    <ReactLenis root>
      <UsageContent />
    </ReactLenis>
  );
}
