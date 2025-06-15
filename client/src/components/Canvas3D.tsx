
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Scene3DProps {
  sceneConfig: {
    geometry: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane';
    color: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    lighting: {
      ambient: string;
      directional: string;
      intensity: number;
    };
    environment: 'studio' | 'sunset' | 'dawn' | 'night' | 'forest';
    animation: 'none' | 'rotate' | 'bounce' | 'pulse';
  };
  onSceneUpdate?: (config: any) => void;
}

function AnimatedGeometry({ config }: { config: Scene3DProps['sceneConfig'] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    setTime(time + delta);
    
    switch (config.animation) {
      case 'rotate':
        meshRef.current.rotation.y = time;
        break;
      case 'bounce':
        meshRef.current.position.y = config.position[1] + Math.sin(time * 2) * 0.5;
        break;
      case 'pulse':
        const pulseFactor = 1 + Math.sin(time * 3) * 0.2;
        meshRef.current.scale.setScalar(pulseFactor);
        break;
      default:
        meshRef.current.rotation.set(...config.rotation);
        meshRef.current.position.set(...config.position);
        meshRef.current.scale.set(...config.scale);
    }
  });

  const getGeometry = () => {
    switch (config.geometry) {
      case 'sphere':
        return <sphereGeometry args={[1, 32, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[1, 1, 2, 32]} />;
      case 'cone':
        return <coneGeometry args={[1, 2, 32]} />;
      case 'torus':
        return <torusGeometry args={[1, 0.4, 16, 100]} />;
      case 'plane':
        return <planeGeometry args={[2, 2]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh 
      ref={meshRef}
      position={config.position}
      rotation={config.rotation}
      scale={config.scale}
    >
      {getGeometry()}
      <meshStandardMaterial color={config.color} />
    </mesh>
  );
}

export default function Canvas3D({ sceneConfig, onSceneUpdate }: Scene3DProps) {
  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <Environment preset={sceneConfig.environment} />
        
        <ambientLight 
          color={sceneConfig.lighting.ambient} 
          intensity={sceneConfig.lighting.intensity * 0.3} 
        />
        <directionalLight 
          color={sceneConfig.lighting.directional}
          intensity={sceneConfig.lighting.intensity}
          position={[10, 10, 5]}
          castShadow
        />
        
        <AnimatedGeometry config={sceneConfig} />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
