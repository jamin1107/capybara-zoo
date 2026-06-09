import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { CapybaraAnimation } from '@/types/game';

// Vite 会处理这个 import 并生成正确的路径（带 base path）
import capybaraModel from '@/assets/capybara.glb?url';

interface CapybaraModelProps {
  animation: CapybaraAnimation;
  onClick?: () => void;
  scale?: number;
  furColor?: string;
  accessories?: string[];
}

function GLBCapybara({ animation, onClick, scale = 1 }: {
  animation: CapybaraAnimation;
  onClick?: () => void;
  scale?: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF(capybaraModel);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const g = groupRef.current;
    if (!g) return;

    if (animation === 'walking' || animation === 'running') {
      const speed = animation === 'running' ? 8 : 4;
      g.position.y += Math.sin(t * speed) * 0.008;
    }
    if (animation === 'happy') {
      g.position.y = Math.abs(Math.sin(t * 6)) * 0.12;
      g.rotation.y += Math.sin(t * 3) * 0.02;
    }
    if (animation === 'idle' || animation === 'resting') {
      g.position.y += Math.sin(t * 1.5) * 0.003;
    }
    if (animation === 'resting') {
      g.position.y = THREE.MathUtils.lerp(g.position.y, -0.05, delta * 3);
    }
    if (animation === 'sleeping') {
      g.position.y = THREE.MathUtils.lerp(g.position.y, -0.08, delta * 3);
    }
  });

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    onClick?.();
  }, [onClick]);

  return (
    <group ref={groupRef} onClick={handleClick}>
      <primitive object={clonedScene} scale={scale * 0.8} />
    </group>
  );
}

export function CapybaraModelWithFallback(props: CapybaraModelProps) {
  return <GLBCapybara {...props} />;
}
