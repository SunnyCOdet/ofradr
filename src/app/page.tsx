"use client"
import React from 'react'
import GlassNavbar from './experiment/Navbar'
import MainHero from './experiment/MainHero'
import SpinningCircle from './experiment/Spinner'
import Component from './experiment/Pricing'
import { Footer } from './experiment/Footer'
import WaitlistModal from './components/WaitlistModal'
import Lightning from '../components/Lightning'

function page() {
  return (
    <div className='relative flex flex-col justify-center min-h-screen overflow-hidden'>
    <div className='min-h-screen'>
      <div className="fixed inset-0 -z-10">
        <Lightning hue={350} speed={0.5} intensity={1} />
      </div>
      <GlassNavbar />
      <MainHero/>
      <SpinningCircle />
    </div>
        <div>
          <Component/>
        </div>
        <Footer/>
        <WaitlistModal />
    </div>
  )
}

export default page