import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import type { CapybaraAnimation } from '@/types/game';

interface CapybaraModelProps {
  animation: CapybaraAnimation;
  onClick?: () => void;
  scale?: number;
  furColor?: string;
  accessories?: string[];
}

// Stable path: GLB in public/ directory (no hash)
const GLB_PUBLIC_PATH = `${import.meta.env.BASE_URL}capybara.glb`;
// jsDelivr CDN as fallback (faster in China)
const GLB_CDN_URL = 'https://cdn.jsdelivr.net/gh/jamin1107/capybara-zoo@main/public/capybara.glb';

// Reduced scale: capybara should be smaller than trees (tree ~2m tall)
const SCALE_FACTOR = 0.5;

function GLBCapybara({ animation, onClick, scale = 1 }: {
  animation: CapybaraAnimation;
  onClick?: () => void;
  scale?: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const [model, setModel] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new GLTFLoader();

    const tryLoad = (url: string) => {
      let timeoutId: number;

      const clearAndRetry = () => {
        clearTimeout(timeoutId);
        if (cancelled) return;
        // Try CDN as fallback after 60s
        if (url === GLB_PUBLIC_PATH) {
          console.warn('[GLB] Primary source timeout, trying CDN');
          tryLoad(GLB_CDN_URL);
        }
      };

      timeoutId = window.setTimeout(clearAndRetry, 60000);

      loader.load(
        url,
        (gltf) => {
          clearTimeout(timeoutId);
          if (cancelled) return;
          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          setModel(gltf.scene);
        },
        undefined,
        () => {
          clearTimeout(timeoutId);
          if (cancelled) return;
          if (url === GLB_PUBLIC_PATH) {
            console.warn('[GLB] Primary load failed, trying CDN');
            tryLoad(GLB_CDN_URL);
          } else {
            console.error('[GLB] CDN failed, retrying in 3s');
            setTimeout(() => tryLoad(GLB_CDN_URL), 3000);
          }
        }
      );
    };

    tryLoad(GLB_PUBLIC_PATH);
    return () => { cancelled = true; };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const g = groupRef.current;
    if (!g) return;

    // Reset each frame
    g.position.y = 0;
    g.rotation.x = 0;
    g.rotation.z = 0;
    // Don't reset rotation.y — it's controlled by the AI for facing direction

    const lerpSpeed = 5;

    if (animation === 'sleeping') {
      // 趴下睡觉：低头趴地 + 缓慢呼吸
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, Math.PI * 0.15, delta * lerpSpeed);
      g.position.y = THREE.MathUtils.lerp(g.position.y, -0.12 + Math.sin(t * 0.8) * 0.003, delta * lerpSpeed);
    } else if (animation === 'sleepy') {
      // 打盹：半趴状态 + 轻微点头
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, Math.PI * 0.08, delta * lerpSpeed);
      g.position.y = THREE.MathUtils.lerp(g.position.y, -0.06 + Math.sin(t * 1) * 0.003, delta * lerpSpeed);
    } else if (animation === 'resting') {
      // 趴着休息：轻微低头
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, Math.PI * 0.05, delta * lerpSpeed);
      g.position.y = THREE.MathUtils.lerp(g.position.y, -0.05 + Math.sin(t * 1) * 0.003, delta * lerpSpeed);
    } else if (animation === 'happy') {
      // 开心弹跳：连续跳跃 + 左右摇摆
      g.position.y = Math.abs(Math.sin(t * 6)) * 0.15;
      g.rotation.z = Math.sin(t * 3) * 0.1;
    } else if (animation === 'walking') {
      // 走路：上下弹跳 + 左右摇摆
      g.position.y = Math.abs(Math.sin(t * 4)) * 0.04;
      g.rotation.z = Math.sin(t * 2) * 0.02;
    } else if (animation === 'running') {
      // 跑步：更大的弹跳 + 更快的摇摆
      g.position.y = Math.abs(Math.sin(t * 6)) * 0.06;
      g.rotation.z = Math.sin(t * 3) * 0.04;
    } else if (animation === 'eating') {
      // 吃东西：低头上下摆动
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, Math.PI * 0.08 + Math.sin(t * 3) * 0.05, delta * lerpSpeed);
      g.position.y = THREE.MathUtils.lerp(g.position.y, -0.03, delta * lerpSpeed);
    } else if (animation === 'bathing') {
      // 洗澡：左右抖动
      g.rotation.z = Math.sin(t * 8) * 0.08;
      g.position.y = THREE.MathUtils.lerp(g.position.y, Math.abs(Math.sin(t * 4)) * 0.02, delta * lerpSpeed);
    } else {
      // idle: 呼吸感 — 轻微上下浮动
      g.position.y = Math.sin(t * 1.5) * 0.005;
    }
  });

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    onClick?.();
  }, [onClick]);

  if (!model) return null;

  return (
    <group ref={groupRef} onClick={handleClick}>
      <primitive object={model} scale={scale * SCALE_FACTOR} />
    </group>
  );
}

export function CapybaraModelWithFallback(props: CapybaraModelProps) {
  return <GLBCapybara {...props} />;
}
