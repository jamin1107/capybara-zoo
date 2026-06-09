import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { RainSystem } from './RainSystem';

export function WeatherEffects() {
  const weather = useGameStore((state) => state.weather);
  const [thunderFlash, setThunderFlash] = useState(false);
  const thunderTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (weather.type !== 'rainy') {
      setThunderFlash(false);
      return;
    }

    const scheduleThunder = () => {
      const delay = 5000 + Math.random() * 15000;
      thunderTimerRef.current = setTimeout(() => {
        if (useGameStore.getState().weather.type === 'rainy') {
          setThunderFlash(true);
          setTimeout(() => setThunderFlash(false), 150);
          setTimeout(() => setThunderFlash(true), 300);
          setTimeout(() => setThunderFlash(false), 450);
        }
        scheduleThunder();
      }, delay);
    };

    scheduleThunder();

    return () => {
      if (thunderTimerRef.current) clearTimeout(thunderTimerRef.current);
    };
  }, [weather.type]);

  return (
    <>
      {/* Rain system */}
      {weather.type === 'rainy' && <RainSystem />}

      {/* Cloud overlay for cloudy weather */}
      {weather.type === 'cloudy' && (
        <CloudOverlay intensity={weather.intensity || 0.5} />
      )}

      {/* Thunder flash overlay */}
      {thunderFlash && (
        <div
          className="absolute inset-0 pointer-events-none z-50 transition-opacity duration-75"
          style={{ background: 'rgba(255,255,255,0.7)' }}
        />
      )}
    </>
  );
}

function CloudOverlay({ intensity }: { intensity: number }) {
  return (
    <>
      <Cloud position={[-3, 8, -5]} scale={2} opacity={0.3 * intensity} />
      <Cloud position={[2, 9, -3]} scale={1.5} opacity={0.25 * intensity} />
      <Cloud position={[5, 7, -7]} scale={1.8} opacity={0.35 * intensity} />
      <Cloud position={[-6, 10, -2]} scale={1.2} opacity={0.2 * intensity} />
    </>
  );
}

function Cloud({ position, scale, opacity }: { position: [number, number, number]; scale: number; opacity: number }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = position[0] + Math.sin(state.clock.getElapsedTime() * 0.1) * 0.5;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={scale}>
      {[
        [0, 0, 0, 1.5],
        [1.2, 0.2, 0, 1.2],
        [-1, 0.1, 0, 1.1],
        [0.5, 0.5, 0, 1],
        [-0.3, 0.3, 0.2, 0.9],
      ].map((sphere, i) => (
        <mesh key={i} position={[sphere[0], sphere[1], sphere[2]]}>
          <sphereGeometry args={[sphere[3], 12, 12]} />
          <meshStandardMaterial
            color="#888899"
            transparent
            opacity={opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
