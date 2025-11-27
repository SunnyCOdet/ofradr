"use client"
import React, { useRef } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import GlassNavbar from './experiment/Navbar'
import MainHero from './experiment/MainHero'
import Component from './experiment/Pricing'
import { Footer } from './experiment/Footer'

import Lightning from '../components/Lightning'
import { ChevronUp, ChevronDown } from "lucide-react"

function HomeContent() {
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
    <div className='relative flex flex-col min-h-screen overflow-x-hidden'>
      <div className="fixed inset-0 -z-10">
        <Lightning hue={350} speed={0.5} intensity={1} />
      </div>
      
      <GlassNavbar />

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

      <div ref={(el) => { sectionRefs.current[0] = el; }} className='min-h-screen w-full flex items-center justify-center'>
        <MainHero/>
      </div>
      
      <div ref={(el) => { sectionRefs.current[1] = el; }} className='min-h-screen w-full flex items-center justify-center'>
        <Component/>
      </div>

      <div ref={(el) => { sectionRefs.current[3] = el; }}>
        <Footer/>
      </div>

    </div>
  )
}

export default function page() {
  return (
    <ReactLenis root>
      <HomeContent />
    </ReactLenis>
  )
}