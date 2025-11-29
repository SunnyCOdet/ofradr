'use client';

import React from 'react';
import ColorBends from '../../components/ColorBends';
import { Big_Shoulders_Display } from "next/font/google";

const bigShoulders = Big_Shoulders_Display({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export default function DemonstrationPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ColorBends 
          className="w-full h-full" 
          colors={['#ff0000', '#ff0000ff', '#ff1010ff', '#ff0707ff', '#ff1919ff']}
          speed={0.3}
          rotation={45}
        />
      </div>
      <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-transparent px-16 py-8 rounded-lg backdrop-blur-sm">
          <h1 className={`${bigShoulders.className} text-9xl font-black text-white uppercase`}>
            Demonstration
          </h1>
        </div>
      </div>
    </div>
  );
}
