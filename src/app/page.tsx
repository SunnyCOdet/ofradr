"use client"
import React from 'react'
import GlassNavbar from './experiment/Navbar'
import MainHero from './experiment/MainHero'
import SpinningCircle from './experiment/Spinner'
import Component from './experiment/Pricing'
import { Footer } from './experiment/Footer'
function page() {
  return (
    <div className='bg-black relative flex flex-col justify-center min-h-screen overflow-hidden'>
    <div className='min-h-screen'>
      <div className="absolute overflow-hidden  top-0 left-1/2 -translate-x-1/2 -translate-y-[40%] inset-0 h-[800px] w-[800px] 
       bg-[radial-gradient(circle,#ea3a59_0%,#ea3a59_20%,transparent_60%,transparent_100%)] 
       rounded-full blur-2xl " />
      <GlassNavbar transparency={8} tintColor="rgba(0, 0, 0, 0.4)" blurIntensity="md" />
      <MainHero/>
      <SpinningCircle />
    </div>
        <div>
          <Component/>
        </div>
        <Footer/>
    </div>
  )
}

export default page