
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { ThreeDScene } from '@shared/types';

interface ThreeDCanvasProps {
  sceneData?: Partial<ThreeDScene['sceneData']>;
  isInteractive?: boolean;
  onSceneUpdate?: (sceneData: ThreeDScene['sceneData']) => void;
}

function AnimatedMesh({ 
  geometry, 
  material, 
  animation 
}: { 
  geometry: string; 
  material: any; 
  animation?: any;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current || !animation) return;
    
    switch (animation.type) {
      case 'rotate':
        meshRef.current.rotation.y += delta * animation.speed;
        break;
      case 'bounce':
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * animation.speed) * 0.5;
        break;
      case 'float':
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * animation.speed) * 0.2;
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * animation.speed * 0.5) * 0.1;
        break;
    }
  });

  const renderGeometry = () => {
    switch (geometry) {
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.8, 32, 32]} />;
      case 'plane':
        return <planeGeometry args={[5, 5]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh ref={meshRef}>
      {renderGeometry()}
      <meshStandardMaterial 
        color={material.color || '#ffffff'}
        metalness={material.metalness || 0}
        roughness={material.roughness || 0.5}
      />
    </mesh>
  );
}

function ParticleSystem({ particles }: { particles?: any }) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = particles?.count || 100;
  
  const positions = React.useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, [particleCount]);

  useFrame(() => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y += 0.001;
  });

  if (!particles) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        color={particles.color || '#ffffff'} 
        size={0.05}
        sizeAttenuation
      />
    </points>
  );
}

function SceneLighting({ lighting }: { lighting?: any }) {
  const defaultLighting = {
    ambient: { intensity: 0.5, color: '#ffffff' },
    directional: { intensity: 1, color: '#ffffff', position: [5, 5, 5] }
  };
  
  const lights = lighting || defaultLighting;
  
  return (
    <>
      <ambientLight 
        intensity={lights.ambient.intensity} 
        color={lights.ambient.color} 
      />
      <directionalLight
        intensity={lights.directional.intensity}
        color={lights.directional.color}
        position={lights.directional.position}
        castShadow
      />
    </>
  );
}

export default function ThreeDCanvas({ 
  sceneData, 
  isInteractive = true,
  onSceneUpdate 
}: ThreeDCanvasProps) {
  const [currentScene, setCurrentScene] = useState(sceneData);

  useEffect(() => {
    setCurrentScene(sceneData);
  }, [sceneData]);

  const defaultScene = {
    geometry: 'cube',
    material: { color: '#4f46e5', metalness: 0.2, roughness: 0.3 },
    lighting: {
      ambient: { intensity: 0.3, color: '#ffffff' },
      directional: { intensity: 1, color: '#ffffff', position: [5, 5, 5] }
    },
    camera: { position: [0, 0, 5], rotation: [0, 0, 0] },
  };

  const scene = currentScene || defaultScene;

  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ 
          position: scene.camera?.position || [0, 0, 5],
          fov: 75
        }}
        shadows
      >
        <SceneLighting lighting={scene.lighting} />
        
        <AnimatedMesh 
          geometry={scene.geometry || 'cube'}
          material={scene.material || defaultScene.material}
          animation={scene.animation}
        />
        
        <ParticleSystem particles={scene.particles} />
        
        <Stars 
          radius={100} 
          depth={50} 
          count={1000} 
          factor={4} 
          saturation={0} 
          fade 
        />
        
        {isInteractive && <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />}
      </Canvas>
    </div>
  );
}
