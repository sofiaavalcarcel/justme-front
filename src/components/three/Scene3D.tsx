import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedOrb({ color1 = '#8b45ff', color2 = '#ff3366', speed = 2, distort = 0.4, scale = 1.8 }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const gradientMap = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 256, 0);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 1);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, [color1, color2]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.6}>
      <Sphere ref={meshRef} args={[1, 128, 128]} scale={scale}>
        <MeshDistortMaterial
          map={gradientMap}
          distort={distort}
          speed={3}
          roughness={0.2}
          metalness={0.8}
          emissive={color1}
          emissiveIntensity={0.15}
        />
      </Sphere>
    </Float>
  );
}

interface Scene3DProps {
  className?: string;
  color1?: string;
  color2?: string;
  scale?: number;
  distort?: number;
}

export function Scene3D({ className, color1, color2, scale, distort }: Scene3DProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color={color2 || '#ff3366'} />
        <AnimatedOrb color1={color1} color2={color2} scale={scale} distort={distort} />
      </Canvas>
    </div>
  );
}
