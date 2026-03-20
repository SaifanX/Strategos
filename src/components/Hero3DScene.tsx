import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Wireframe, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

const AbstractShape: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Rotate based on time and scroll
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2 + (scrollY * 0.005);
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3 + (scrollY * 0.01);
    
    // Distort based on scroll (assuming scrollY goes from 0 to ~3000)
    if (materialRef.current) {
      materialRef.current.distort = 0.2 + Math.min(scrollY / 2000, 0.8);
      materialRef.current.speed = 1 + scrollY / 1000;
    }
  });

  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={2}>
      <mesh ref={meshRef} scale={1.5}>
        <icosahedronGeometry args={[2, 4]} />
        <MeshDistortMaterial
          ref={materialRef}
          color="#FF6321" // jet-orange
          emissive="#FF6321"
          emissiveIntensity={0.5}
          wireframe
          distort={0.4}
          speed={2}
          roughness={0}
          metalness={1}
        />
      </mesh>
    </Float>
  );
};

const OrbitingNodes = ({ scrollY }: { scrollY: number }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1 - (scrollY * 0.002);
    groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.05 + (scrollY * 0.001);
  });

  // Create 12 orbiting spheres representing agents
  return (
    <group ref={groupRef}>
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <mesh key={i} position={[x, (i % 2 === 0 ? 1 : -1) * 2, z]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial 
              color={i % 3 === 0 ? "#FF6321" : i % 2 === 0 ? "#00FFCC" : "#ffffff"} 
              emissive={i % 3 === 0 ? "#FF6321" : i % 2 === 0 ? "#00FFCC" : "#ffffff"}
              emissiveIntensity={0.8}
              wireframe
            />
          </mesh>
        );
      })}
    </group>
  );
};

export const Hero3DScene: React.FC = () => {
  const [scrollY, setScrollY] = React.useState(0);

  // Simple vanilla scroll listener since Canvas is outside framer-motion context usually
  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#FF6321" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#00FFCC" />
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        <AbstractShape scrollY={scrollY} />
        <OrbitingNodes scrollY={scrollY} />
      </Canvas>
    </div>
  );
};
