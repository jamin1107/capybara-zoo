import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Decoration3DProps {
  model: string;
  position: [number, number, number];
}

export function Decoration3D({ model, position }: Decoration3DProps) {
  switch (model) {
    case 'mushroom':
      return <Mushroom position={position} />;
    case 'bench':
      return <Bench position={position} />;
    case 'fountain':
      return <Fountain position={position} />;
    case 'lantern':
      return <Lantern position={position} />;
    case 'sunflower':
      return <Sunflower position={position} />;
    case 'fence':
      return <Fence position={position} />;
    default:
      return null;
  }
}

function Mushroom({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* White stem */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.6, 12]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
      {/* Red cap */}
      <mesh position={[0, 0.65, 0]} rotation={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.45, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#DC143C" />
      </mesh>
      {/* White spots */}
      <mesh position={[0.15, 0.75, 0.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.2, 0.72, -0.15]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.05, 0.78, -0.3]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}

function Bench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Seat plank */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.2, 0.08, 0.5]} />
        <meshStandardMaterial color="#8B5A2B" />
      </mesh>
      {/* Back plank */}
      <mesh position={[0, 0.6, -0.22]} rotation={[0.1, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.06]} />
        <meshStandardMaterial color="#8B5A2B" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.5, 0.175, 0.15]} castShadow>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      <mesh position={[0.5, 0.175, 0.15]} castShadow>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      <mesh position={[-0.5, 0.175, -0.15]} castShadow>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      <mesh position={[0.5, 0.175, -0.15]} castShadow>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
    </group>
  );
}

function Fountain({ position }: { position: [number, number, number] }) {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (waterRef.current) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.5 + Math.sin(state.clock.getElapsedTime() * 2) * 0.2;
      waterRef.current.position.y = 0.8 + Math.sin(state.clock.getElapsedTime() * 3) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Stone base */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.8, 0.5, 16]} />
        <meshStandardMaterial color="#808080" />
      </mesh>
      {/* Inner basin */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
      {/* Water */}
      <mesh ref={waterRef} position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshStandardMaterial color="#4FC3F7" transparent opacity={0.6} />
      </mesh>
      {/* Center pillar */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 0.6, 8]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
      {/* Top sphere */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
    </group>
  );
}

function Lantern({ position }: { position: [number, number, number] }) {
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.6 + Math.sin(state.clock.getElapsedTime() * 2) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Red cylinder body */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 8]} />
        <meshStandardMaterial color="#DC143C" />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <coneGeometry args={[0.2, 0.15, 8]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      {/* Bottom cap */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 8]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      {/* Yellow glow */}
      <mesh ref={glowRef} position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#FFD700" transparent opacity={0.5} emissive="#FFD700" emissiveIntensity={0.5} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 6]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      {/* Point light */}
      <pointLight position={[0, 0.6, 0]} color="#FFD700" intensity={1.5} distance={4} />
    </group>
  );
}

function Sunflower({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Green stem */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.8, 6]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      {/* Leaves */}
      <mesh position={[0.1, 0.3, 0]} rotation={[0.3, 0, -0.5]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#32CD32" />
      </mesh>
      <mesh position={[-0.08, 0.5, 0.05]} rotation={[0.2, 0, 0.5]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#32CD32" />
      </mesh>
      {/* Brown center */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* Yellow petals */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i * Math.PI * 2) / 8;
        const x = Math.cos(angle) * 0.2;
        const z = Math.sin(angle) * 0.2;
        return (
          <mesh key={i} position={[x, 0.85, z]} castShadow>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        );
      })}
    </group>
  );
}

function Fence({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Posts */}
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 0.35, 0]} castShadow>
          <boxGeometry args={[0.08, 0.7, 0.08]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>
      ))}
      {/* Pointed tops */}
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={`top-${i}`} position={[x, 0.75, 0]} castShadow>
          <coneGeometry args={[0.05, 0.12, 4]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>
      ))}
      {/* Horizontal bars */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.1, 0.06, 0.06]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.1, 0.06, 0.06]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
    </group>
  );
}
