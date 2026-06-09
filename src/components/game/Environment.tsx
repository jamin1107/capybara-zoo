import { useMemo } from 'react';
import * as THREE from 'three';
import { randomGreenColor, randomBrownColor } from '@/utils/geometry';

function Tree({ position }: { position: [number, number, number] }) {
  const trunkColor = useMemo(() => randomBrownColor(), []);
  const canopyColor = useMemo(() => randomGreenColor(), []);

  const trunkMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: trunkColor, roughness: 0.9 }),
    [trunkColor]
  );

  const canopyMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.8 }),
    [canopyColor]
  );

  return (
    <group position={position}>
      <mesh material={trunkMaterial} position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
      </mesh>
      <mesh material={canopyMaterial} position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[1.2, 2, 8]} />
      </mesh>
      <mesh material={canopyMaterial} position={[0, 3.2, 0]} castShadow>
        <coneGeometry args={[0.9, 1.5, 8]} />
      </mesh>
    </group>
  );
}

function Rock({ position }: { position: [number, number, number] }) {
  const rockColor = useMemo(
    () => new THREE.Color(0.4 + Math.random() * 0.15, 0.4 + Math.random() * 0.1, 0.35 + Math.random() * 0.1),
    []
  );

  const rockMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: rockColor, roughness: 0.95 }),
    [rockColor]
  );

  const sx = useMemo(() => 0.3 + Math.random() * 0.4, []);
  const sy = useMemo(() => 0.2 + Math.random() * 0.3, []);
  const sz = useMemo(() => 0.3 + Math.random() * 0.4, []);

  return (
    <mesh material={rockMaterial} position={position} rotation={[Math.random(), Math.random(), Math.random()]} castShadow scale={[sx, sy, sz]}>
      <icosahedronGeometry args={[0.4, 1]} />
    </mesh>
  );
}

function Flower({ position }: { position: [number, number, number] }) {
  const petalColors = useMemo(
    () => [
      new THREE.Color(0.9, 0.3, 0.4),
      new THREE.Color(0.9, 0.7, 0.2),
      new THREE.Color(0.9, 0.5, 0.8),
      new THREE.Color(0.6, 0.3, 0.9),
    ],
    []
  );
  const petalColor = useMemo(() => petalColors[Math.floor(Math.random() * petalColors.length)], []);

  const stemMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x2d5a1e, roughness: 0.8 }),
    []
  );
  const petalMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: petalColor, roughness: 0.6 }),
    [petalColor]
  );

  return (
    <group position={position}>
      <mesh material={stemMaterial} position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
      </mesh>
      <mesh material={petalMaterial} position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.08, 6, 6]} />
      </mesh>
    </group>
  );
}

export function Environment() {
  const trees: [number, number, number][] = useMemo(
    () => [
      [-6, 0, -3],
      [5, 0, -4],
      [-4, 0, 5],
      [7, 0, 2],
      [2, 0, -6],
    ],
    []
  );

  const rocks: [number, number, number][] = useMemo(
    () => [
      [-3, 0.2, 3],
      [4, 0.2, -2],
      [6, 0.2, 4],
    ],
    []
  );

  const flowers: [number, number, number][] = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 16;
      const z = (Math.random() - 0.5) * 16;
      positions.push([x, 0, z]);
    }
    return positions;
  }, []);

  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[20, 64]} />
        <meshStandardMaterial color={0x4a7c3f} roughness={0.9} />
      </mesh>

      {/* Pond */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, 0.01, 3]} receiveShadow>
        <circleGeometry args={[2.5, 32]} />
        <meshStandardMaterial
          color={0x3498db}
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* Trees */}
      {trees.map((pos, i) => (
        <Tree key={`tree-${i}`} position={pos} />
      ))}

      {/* Rocks */}
      {rocks.map((pos, i) => (
        <Rock key={`rock-${i}`} position={pos} />
      ))}

      {/* Flowers */}
      {flowers.map((pos, i) => (
        <Flower key={`flower-${i}`} position={pos} />
      ))}
    </>
  );
}
