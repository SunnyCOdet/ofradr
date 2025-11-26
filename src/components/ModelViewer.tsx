import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';

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
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
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
