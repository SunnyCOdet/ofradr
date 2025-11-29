'use client';

import React from 'react';
import ColorBends from '../../components/ColorBends';
import ModelViewer from '../../components/ModelViewer';
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
      <div className="absolute inset-0 z-50 flex flex-col pointer-events-none">
        <div className="flex-1 pointer-events-auto">
          <ModelViewer 
            url="/FinalLappy.glb"
            autoRotate={false}
            autoRotateSpeed={0}
            cameraPosition={[0, 2, 2]}
            scale={1.5}
          />
        </div>
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="bg-transparent px-16 py-4 rounded-lg backdrop-blur-sm">
            <h1 className={`${bigShoulders.className} text-7xl font-black text-white uppercase`}>
              Demonstration
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
