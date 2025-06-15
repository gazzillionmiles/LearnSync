
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Grid } from '@react-three/drei';
import * as THREE from 'three';

interface SceneObject {
  id: string;
  type: 'sphere' | 'cube' | 'cylinder' | 'plane';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  material: {
    color: string;
    metalness: number;
    roughness: number;
    emissive?: string;
  };
}

interface SceneConfig {
  objects: SceneObject[];
  lighting: {
    ambient: { intensity: number; color: string };
    directional: { intensity: number; color: string; position: [number, number, number] };
  };
  environment: {
    background: string;
    fog?: { color: string; density: number };
  };
  particles?: {
    count: number;
    size: number;
    color: string;
    speed: number;
  };
}

interface ThreeDCanvasProps {
  sceneConfig: SceneConfig;
  onSceneUpdate?: (config: SceneConfig) => void;
}

function SceneObject({ object }: { object: SceneObject }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = React.useMemo(() => {
    switch (object.type) {
      case 'sphere':
        return new THREE.SphereGeometry(1, 32, 32);
      case 'cube':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'cylinder':
        return new THREE.CylinderGeometry(1, 1, 2, 32);
      case 'plane':
        return new THREE.PlaneGeometry(2, 2);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [object.type]);

  return (
    <mesh
      ref={meshRef}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      geometry={geometry}
    >
      <meshStandardMaterial
        color={object.material.color}
        metalness={object.material.metalness}
        roughness={object.material.roughness}
        emissive={object.material.emissive || '#000000'}
      />
    </mesh>
  );
}

function ParticleSystem({ particles }: { particles: SceneConfig['particles'] }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<Float32Array>();

  const particleCount = particles?.count || 100;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    positionsRef.current = pos;
    return pos;
  }, [particleCount]);

  useFrame((state) => {
    if (pointsRef.current && positionsRef.current) {
      const time = state.clock.getElapsedTime();
      const speed = particles?.speed || 0.5;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positionsRef.current[i3] += Math.sin(time * speed + i) * 0.01;
        positionsRef.current[i3 + 1] += Math.cos(time * speed + i) * 0.01;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!particles) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={particleCount}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={particles.color}
        size={particles.size}
        sizeAttenuation={true}
      />
    </points>
  );
}

function SceneLighting({ lighting }: { lighting: SceneConfig['lighting'] }) {
  return (
    <>
      <ambientLight 
        intensity={lighting.ambient.intensity} 
        color={lighting.ambient.color} 
      />
      <directionalLight
        intensity={lighting.directional.intensity}
        color={lighting.directional.color}
        position={lighting.directional.position}
        castShadow
      />
    </>
  );
}

export default function ThreeDCanvas({ sceneConfig, onSceneUpdate }: ThreeDCanvasProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, [sceneConfig]);

  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
          <div className="text-white">Loading 3D Scene...</div>
        </div>
      )}
      
      <Canvas
        shadows
        style={{ background: sceneConfig.environment.background }}
        camera={{ position: [5, 5, 5], fov: 75 }}
      >
        <PerspectiveCamera makeDefault position={[5, 5, 5]} />
        
        <SceneLighting lighting={sceneConfig.lighting} />
        
        {sceneConfig.objects.map((object) => (
          <SceneObject key={object.id} object={object} />
        ))}
        
        <ParticleSystem particles={sceneConfig.particles} />
        
        {sceneConfig.environment.fog && (
          <fog
            attach="fog"
            args={[
              sceneConfig.environment.fog.color,
              10,
              200
            ]}
          />
        )}
        
        <Grid args={[20, 20]} />
        <Environment preset="sunset" />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
        Use mouse to orbit, zoom, and pan
      </div>
    </div>
  );
}
