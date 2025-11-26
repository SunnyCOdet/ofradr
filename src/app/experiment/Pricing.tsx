"use client"

import { useRef } from "react"  
import ModelViewer from "../../components/ModelViewer"


export default function Component() {
  
 

  return (
<div>


    <div style={{ height: 600 }}>
      <ModelViewer url="/b2bitch.glb" autoRotate autoRotateSpeed={0.1} />
    </div>
</div>
  )
}
