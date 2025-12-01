'use client';

import React, { useState } from 'react';
import ColorBends from '../../components/ColorBends';
import { MacbookScroll } from '../../components/ui/macbook-scroll';
import { Big_Shoulders_Display } from "next/font/google";
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const bigShoulders = Big_Shoulders_Display({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

const images = [
  '/photos/IMG_2127.png',
  '/photos/PNG image.png',
  '/photos/PNG image 2.png',
  '/photos/PNG image 3.png',
  '/photos/PNG image 4.png',
  '/photos/PNG image 5.png',
  '/photos/PNG image 6.png',
  '/photos/PNG image 7.png',
  '/photos/PNG image 8.png',
  '/photos/PNG image 9.png',
  '/photos/PNG image 10.png',
];

export default function DemoPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full bg-black">
      <Link href="/" className="fixed top-8 left-8 z-50 text-white hover:text-[#ea3a59] transition-colors">
        <ArrowLeft size={32} />
      </Link>
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <ColorBends 
          className="w-full h-full" 
          colors={['#ff0000', '#ff0000ff', '#ff1010ff', '#ff0707ff', '#ff1919ff']}
          speed={0.3}
          rotation={45}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <MacbookScroll
          src={images[currentImageIndex]}
          showGradient={false}
          title={
            <h1 className={`${bigShoulders.className} text-8xl md:text-9xl font-black text-white uppercase tracking-wider`}>
              Demonstration
            </h1>
          }
        />

        {/* Navigation Buttons */}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6">
          <button
            onClick={handlePrevious}
            className="group flex items-center justify-center w-14 h-14 rounded-full bg-[#ea3a59] border border-[#ea3a59] hover:bg-[#d93350] transition-all duration-300 hover:scale-110 shadow-[0_0_20px_rgba(234,58,89,0.3)] hover:shadow-[0_0_30px_rgba(234,58,89,0.5)]"
            aria-label="Previous image"
          >
            <IconChevronLeft className="w-7 h-7 text-white" />
          </button>
          
          <div className="px-6 py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <span className="text-white font-semibold">
              {currentImageIndex + 1} / {images.length}
            </span>
          </div>
          
          <button
            onClick={handleNext}
            className="group flex items-center justify-center w-14 h-14 rounded-full bg-[#ea3a59] border border-[#ea3a59] hover:bg-[#d93350] transition-all duration-300 hover:scale-110 shadow-[0_0_20px_rgba(234,58,89,0.3)] hover:shadow-[0_0_30px_rgba(234,58,89,0.5)]"
            aria-label="Next image"
          >
            <IconChevronRight className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
