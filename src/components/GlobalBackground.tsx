"use client"

import { usePathname } from 'next/navigation'
import LiquidEther from './LiquidEther'

export default function GlobalBackground() {
  const pathname = usePathname()

  if (pathname === '/') {
    return null
  }

  return (
    <div className="fixed inset-0 -z-10">
      <LiquidEther />
    </div>
  )
}
