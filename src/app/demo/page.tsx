'use client';

import React from 'react';
import ColorBends from '../../components/ColorBends';
import { MacbookScroll } from '../../components/ui/macbook-scroll';
import { Big_Shoulders_Display } from "next/font/google";

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
  return (
    <div className="relative w-full bg-black">
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
          src={images[0]}
          showGradient={false}
          title={
            <h1 className={`${bigShoulders.className} text-8xl md:text-9xl font-black text-white uppercase tracking-wider`}>
              Demonstration
            </h1>
          }
        />
      </div>
    </div>
  );
}
