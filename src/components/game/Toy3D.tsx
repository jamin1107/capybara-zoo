import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Toy3DProps {
  type: 'ball' | 'frisbee' | 'plush' | 'water_gun';
  position: [number, number, number];
  id: string;
}

export function Toy3D({ type, position }: Toy3DProps) {
  const meshRef = useRef<THREE.Group>(null!);
  const bounceOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * 2 + bounceOffset) * 0.08;
    meshRef.current.rotation.y = t * 0.5;
  });

  if (type === 'ball') {
    return (
      <group ref={meshRef} position={position}>
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#ff4444" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.03, 8, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    );
  }

  if (type === 'frisbee') {
    return (
      <group ref={meshRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.25, 0.25, 0.05, 24]} />
          <meshStandardMaterial color="#44aaff" roughness={0.4} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.06, 24]} />
          <meshStandardMaterial color="#ffaa44" />
        </mesh>
      </group>
    );
  }

  if (type === 'plush') {
    return (
      <group ref={meshRef} position={position}>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.25, 0.3, 0.2]} />
          <meshStandardMaterial color="#8B5E3C" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="#8B5E3C" roughness={0.8} />
        </mesh>
        <mesh position={[-0.12, 0.45, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#6B4226" />
        </mesh>
        <mesh position={[0.12, 0.45, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#6B4226" />
        </mesh>
      </group>
    );
  }

  // water_gun
  return (
    <group ref={meshRef} position={position}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color="#3388ff" roughness={0.3} />
      </mesh>
      <mesh position={[0.08, -0.05, 0]}>
        <boxGeometry args={[0.08, 0.15, 0.12]} />
        <meshStandardMaterial color="#44cc88" />
      </mesh>
      <mesh position={[-0.06, 0.05, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.15, 8]} />
        <meshStandardMaterial color="#3388ff" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}
