"use client"

import { usePathname } from 'next/navigation'
import LiquidEther from './LiquidEther'
import { GridScan } from './GridScan'

export default function GlobalBackground() {
  const pathname = usePathname()

  if (pathname === '/' || pathname === '/usage') {
    return null
  }

  return (
    <div className="fixed inset-0 -z-10 bg-black">
      {pathname === '/about' ? (
        <GridScan linesColor="#2a2a2a" scanColor="#ea3a59" />
      ) : (
        <LiquidEther randomMovement={true} />
      )}
    </div>
  )
}
