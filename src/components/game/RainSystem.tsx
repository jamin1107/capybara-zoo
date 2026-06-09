import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

const RAINDROP_COUNT = 2000;
const DROP_LENGTH = 0.5;

export function RainSystem() {
  const rainRef = useRef<THREE.Points>(null);
  const splashRef = useRef<THREE.Points>(null);
  const intensity = useGameStore((state) => state.weather.intensity);

  const velocities = useMemo(() => {
    const vels = new Float32Array(RAINDROP_COUNT);
    for (let i = 0; i < RAINDROP_COUNT; i++) {
      vels[i] = 0.5 + Math.random() * 0.8;
    }
    return vels;
  }, []);

  const positions = useMemo(() => {
    const pos = new Float32Array(RAINDROP_COUNT * 3);
    for (let i = 0; i < RAINDROP_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  const splashPositions = useMemo(() => {
    const pos = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = 0.01;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!rainRef.current) return;

    const visibleCount = Math.floor(RAINDROP_COUNT * intensity);
    const windX = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.3;

    const pos = rainRef.current.geometry.attributes.position;
    for (let i = 0; i < visibleCount; i++) {
      let y = pos.getY(i) - velocities[i] * delta * 15;

      if (y <= 0) {
        y = 12 + Math.random() * 3;
        pos.setX(i, (Math.random() - 0.5) * 20);
        pos.setZ(i, (Math.random() - 0.5) * 20);
      }

      pos.setX(i, pos.getX(i) + windX * delta);
      pos.setY(i, y);
    }

    for (let i = visibleCount; i < RAINDROP_COUNT; i++) {
      pos.setY(i, -10);
    }

    pos.needsUpdate = true;
  });

  const rainMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0xaaaacc,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    []
  );

  const splashMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0x8888bb,
        size: 0.08,
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    []
  );

  return (
    <>
      <points ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={RAINDROP_COUNT}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <primitive object={rainMaterial} attach="material" />
      </points>

      <points ref={splashRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={500}
            array={splashPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <primitive object={splashMaterial} attach="material" />
      </points>
    </>
  );
}
