"use client"

import { useRef } from "react"  
import ModelViewer from "../../components/ModelViewer"


export default function Component() {
  
 

  return (
<div>


    <div style={{ height: 300, width: '50%' }}>
      <ModelViewer url="/b2bitch.glb" autoRotate autoRotateSpeed={2.5} cameraPosition={[-10, 10, 20]} scale={0.05} />
    </div>
</div>
  )
}
