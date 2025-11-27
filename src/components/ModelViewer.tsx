import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { lightningEvents } from '../lib/lightningEvents';

interface ViewerProps {
  url: string;
  width?: number | string;
  height?: number | string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  cameraPosition?: [number, number, number];
  scale?: number;
}

const Model: React.FC<{ url: string; scale?: number }> = ({ url, scale = 1 }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={scale} />;
};

const ModelViewer: React.FC<ViewerProps> = ({
  url,
  width = '100%',
  height = '100%',
  autoRotate = false,
  autoRotateSpeed = 1,
  cameraPosition = [0, 0, 5],
  scale = 1,
}) => {
  const [isInteracting, setIsInteracting] = React.useState(false);
  const [lightningIntensity, setLightningIntensity] = useState(1);

  useEffect(() => {
    // Subscribe to lightning events
    const unsubscribe = lightningEvents.subscribe((intensity) => {
      setLightningIntensity(intensity);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div 
      style={{ width, height, position: 'relative' }}
      onPointerDown={() => setIsInteracting(true)}
      onPointerLeave={() => setIsInteracting(false)}
    >
      <Canvas
        shadows
        camera={{ position: cameraPosition, fov: 50 }}
        gl={{ alpha: true, preserveDrawingBuffer: true }} // alpha: true enables transparency
        style={{ background: 'transparent' }} // Ensure CSS background is transparent
      >
        {/* Red ambient light for base illumination - reacts to lightning */}
        <ambientLight color="#ff0000" intensity={2 * lightningIntensity} />
        
        {/* Red point lights for dramatic effect - pulsing with lightning */}
        <pointLight position={[10, 10, 10]} color="#ff0000" intensity={10 * lightningIntensity} distance={50} />
        <pointLight position={[-10, -5, 10]} color="#ff3333" intensity={10 * lightningIntensity} distance={50} />
        <pointLight position={[0, 15, -10]} color="#cc0000" intensity={10 * lightningIntensity} distance={50} />
        
        {/* Red directional light for key lighting - subtle reaction */}
        <directionalLight position={[5, 10, 5]} color="#ff1a1a" intensity={1.5 * lightningIntensity} castShadow />
        <Environment preset="city" />
        
        <Suspense fallback={null}>
          <Model url={url} scale={scale} />
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
        </Suspense>

        <OrbitControls 
          autoRotate={autoRotate && !isInteracting} 
          autoRotateSpeed={autoRotateSpeed}
          enableZoom={isInteracting}
          enableRotate={isInteracting}
        />
      </Canvas>
    </div>
  );
};

export default ModelViewer;
