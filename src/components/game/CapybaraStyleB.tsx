import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 风格B - 圆润可爱风
 * 整体更圆更胖：大圆身体、圆头圆脑、短粗四肢
 */
export function CapybaraStyleB() {
  const groupRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);

  const bodyColor = useMemo(() => new THREE.Color(0xA08050), []);
  const bellyColor = useMemo(() => new THREE.Color(0xC8B090), []);
  const darkColor = useMemo(() => new THREE.Color(0x6B4423), []);
  const noseColor = useMemo(() => new THREE.Color(0x2C1810), []);

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.8, flatShading: true }), [bodyColor]);
  const bellyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: bellyColor, roughness: 0.75, flatShading: true }), [bellyColor]);
  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: darkColor, roughness: 0.7, flatShading: true }), [darkColor]);
  const noseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: noseColor, roughness: 0.5 }), [noseColor]);
  const eyeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 }), []);
  const eyeWhite = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xffffff }), []);
  const cheekMat = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color(0xE8A0A0), roughness: 0.7 }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = 0.45 + Math.sin(t * 1.8) * 0.015;
    }
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 1.2) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* === 身体 - 大圆球 === */}
      <mesh material={bodyMat} position={[0, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.5, 12, 10]} />
      </mesh>

      {/* 肚子 */}
      <mesh material={bellyMat} position={[0.1, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.35, 10, 8]} />
      </mesh>

      {/* === 头部 - 大圆球 === */}
      <group ref={headRef} position={[0.45, 0.5, 0]}>
        {/* 圆头 */}
        <mesh material={bodyMat} position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.28, 10, 10]} />
        </mesh>

        {/* 圆鼻吻 */}
        <mesh material={bodyMat} position={[0.25, -0.05, 0]} castShadow>
          <sphereGeometry args={[0.18, 8, 8]} />
        </mesh>

        {/* 大鼻子 */}
        <mesh material={noseMat} position={[0.4, -0.05, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
        </mesh>

        {/* 鼻孔 */}
        <mesh material={noseMat} position={[0.42, -0.02, 0.03]}>
          <sphereGeometry args={[0.02, 4, 4]} />
        </mesh>
        <mesh material={noseMat} position={[0.42, -0.02, -0.03]}>
          <sphereGeometry args={[0.02, 4, 4]} />
        </mesh>

        {/* 大眼睛 */}
        <mesh material={eyeWhite} position={[0.12, 0.08, 0.16]}>
          <sphereGeometry args={[0.06, 8, 8]} />
        </mesh>
        <mesh material={eyeMat} position={[0.15, 0.09, 0.18]}>
          <sphereGeometry args={[0.04, 8, 8]} />
        </mesh>
        <mesh material={eyeWhite} position={[0.18, 0.12, 0.2]}>
          <sphereGeometry args={[0.015, 4, 4]} />
        </mesh>

        <mesh material={eyeWhite} position={[0.12, 0.08, -0.16]}>
          <sphereGeometry args={[0.06, 8, 8]} />
        </mesh>
        <mesh material={eyeMat} position={[0.15, 0.09, -0.18]}>
          <sphereGeometry args={[0.04, 8, 8]} />
        </mesh>
        <mesh material={eyeWhite} position={[0.18, 0.12, -0.2]}>
          <sphereGeometry args={[0.015, 4, 4]} />
        </mesh>

        {/* 腮红 */}
        <mesh material={cheekMat} position={[0.15, -0.08, 0.2]}>
          <sphereGeometry args={[0.06, 6, 6]} />
        </mesh>
        <mesh material={cheekMat} position={[0.15, -0.08, -0.2]}>
          <sphereGeometry args={[0.06, 6, 6]} />
        </mesh>

        {/* 微笑嘴 */}
        <mesh material={darkMat} position={[0.3, -0.1, 0]}>
          <boxGeometry args={[0.08, 0.015, 0.1]} />
        </mesh>

        {/* 小圆耳朵 */}
        <mesh material={bodyMat} position={[-0.08, 0.22, 0.18]}>
          <sphereGeometry args={[0.07, 6, 6]} />
        </mesh>
        <mesh material={bodyMat} position={[-0.08, 0.22, -0.18]}>
          <sphereGeometry args={[0.07, 6, 6]} />
        </mesh>
      </group>

      {/* 小尾巴 */}
      <mesh material={darkMat} position={[-0.5, 0.35, 0]}>
        <sphereGeometry args={[0.04, 6, 6]} />
      </mesh>

      {/* === 短粗腿 === */}
      <mesh material={darkMat} position={[0.2, 0.08, 0.22]} castShadow>
        <capsuleGeometry args={[0.09, 0.15, 4, 8]} />
      </mesh>
      <mesh material={darkMat} position={[0.2, 0.08, -0.22]} castShadow>
        <capsuleGeometry args={[0.09, 0.15, 4, 8]} />
      </mesh>
      <mesh material={darkMat} position={[-0.2, 0.08, 0.22]} castShadow>
        <capsuleGeometry args={[0.09, 0.15, 4, 8]} />
      </mesh>
      <mesh material={darkMat} position={[-0.2, 0.08, -0.22]} castShadow>
        <capsuleGeometry args={[0.09, 0.15, 4, 8]} />
      </mesh>
    </group>
  );
}
