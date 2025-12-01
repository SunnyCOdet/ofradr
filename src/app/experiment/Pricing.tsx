"use client"

import { useRef } from "react"  
import ModelViewer from "../../components/ModelViewer"
import { bigShoulders } from "../../components/fonts"
import { Magnetic } from "@/components/motion-primitives/magnetic"
import { AnimatedGradientText } from "../../components/ui/animated-gradient-text"


export default function Component() {
  
 

  return (
    <div className="flex w-full h-screen items-center justify-center bg-transparent">
      <div className="flex w-full max-w-6xl items-center justify-between px-10">
        {/* Left Side: Model */}
        <div style={{ height: 500, width: '70%' }}>
          <ModelViewer url="/b2bitch.glb" autoRotate autoRotateSpeed={2.5} cameraPosition={[0, 10, 20]} scale={0.04} />
        </div>

        {/* Right Side: Text Content */}
        <div className={`w-[45%] flex flex-col gap-12 text-white ${bigShoulders.className}`}>
          {/* Community Edition */}
          <div className="flex flex-col gap-4">
            <AnimatedGradientText 
              colorFrom="#d94d4dff" 
              colorTo="#ef9595ff" 
              speed={1} 
              className={`text-5xl font-bold ${bigShoulders.className}`}
            >
              Community Edition
            </AnimatedGradientText>
            <p className="text-2xl font-light tracking-wide text-gray-300">
              Open source power for everyone.
            </p>
            <p className="text-2xl font-light tracking-wide text-gray-300">
              Build without limits, free forever.
            </p>
            <div className="mt-2">
              <a href="/ofradr.zip" download className="inline-block">
                <Magnetic className="relative z-10 inline-block">
                  <button className="bg-[#ea3a59] flex items-center justify-center gap-2 w-32 h-14 rounded-full text-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(234,58,89,0.6)] hover:shadow-[0_0_30px_rgba(234,58,89,0.8)] text-black font-bold">
                    <span>Download</span>
                  </button>
                </Magnetic>
              </a>
            </div>
          </div>

          {/* Enterprise Edition */}
          <div className="flex flex-col gap-4">
            <AnimatedGradientText 
              colorFrom="#f472b6" 
              colorTo="#c99abeff" 
              speed={1} 
              className={`text-5xl font-bold ${bigShoulders.className}`}
            >
              Enterprise Edition
            </AnimatedGradientText>
            <p className="text-2xl font-light tracking-wide text-gray-300">
              Advanced security and control.
            </p>
            <p className="text-2xl font-light tracking-wide text-gray-300">
              Scale your business with confidence.
            </p>
            <div className="mt-2">
              <a href="/ofradr.zip" download className="inline-block">
                <Magnetic className="relative z-10 inline-block">
                  <button className="bg-[#f472b6] flex items-center justify-center gap-2 w-32 h-14 rounded-full text-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(244,114,182,0.6)] hover:shadow-[0_0_30px_rgba(244,114,182,0.8)] text-black font-bold">
                    <span>Download</span>
                  </button>
                </Magnetic>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Compare Plans Button */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <a href="/comparison" className="inline-block">
          <Magnetic className="relative z-10 inline-block">
            <button className="bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center gap-2 px-8 py-3 rounded-full text-lg hover:bg-white/20 transition-all text-white font-bold">
              <span>Compare Plans</span>
            </button>
          </Magnetic>
        </a>
      </div>
    </div>
  )
}
