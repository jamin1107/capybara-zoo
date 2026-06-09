import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SNOW_COUNT = 500;

export function SnowParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(SNOW_COUNT * 3);
    const velocities = new Float32Array(SNOW_COUNT * 3);

    for (let i = 0; i < SNOW_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30; // x
      positions[i * 3 + 1] = Math.random() * 15; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30; // z

      velocities[i * 3] = (Math.random() - 0.5) * 0.5; // x drift
      velocities[i * 3 + 1] = -1 - Math.random() * 2; // fall speed
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3; // z drift
    }

    return { positions, velocities };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < SNOW_COUNT; i++) {
      // Update positions based on velocities
      posArray[i * 3] += particles.velocities[i * 3] * delta;
      posArray[i * 3 + 1] += particles.velocities[i * 3 + 1] * delta;
      posArray[i * 3 + 2] += particles.velocities[i * 3 + 2] * delta;

      // Reset particles that fall below ground
      if (posArray[i * 3 + 1] < 0) {
        posArray[i * 3] = (Math.random() - 0.5) * 30;
        posArray[i * 3 + 1] = 12 + Math.random() * 3;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 30;
      }

      // Wrap around horizontal bounds
      if (Math.abs(posArray[i * 3]) > 15) {
        posArray[i * 3] *= -0.9;
      }
      if (Math.abs(posArray[i * 3 + 2]) > 15) {
        posArray[i * 3 + 2] *= -0.9;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={SNOW_COUNT}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#FFFFFF"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}
