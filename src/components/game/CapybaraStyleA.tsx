import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 风格A - 写实风卡皮巴拉
 * 更接近真实比例：身体更长、头部更方正、四肢更粗壮、鼻子突出
 */
export function CapybaraStyleA() {
  const groupRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);

  // 更自然的毛色
  const furColor = useMemo(() => new THREE.Color(0x9B7B52), []);
  const darkFur = useMemo(() => new THREE.Color(0x5C3D2E), []);
  const bellyColor = useMemo(() => new THREE.Color(0xB8A088), []);
  const noseColor = useMemo(() => new THREE.Color(0x2C1810), []);

  const furMat = useMemo(() => new THREE.MeshStandardMaterial({ color: furColor, roughness: 0.9, flatShading: true }), [furColor]);
  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: darkFur, roughness: 0.8, flatShading: true }), [darkFur]);
  const bellyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: bellyColor, roughness: 0.85, flatShading: true }), [bellyColor]);
  const noseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: noseColor, roughness: 0.6 }), [noseColor]);
  const eyeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x1a1a0e, roughness: 0.2 }), []);
  const eyeHighlight = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xffffff }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (headRef.current) {
      headRef.current.position.y = 0.52 + Math.sin(t * 1.5) * 0.008;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* === 身体 - 长桶形 === */}
      <mesh material={furMat} position={[0, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.35, 0.9, 8, 12]} />
      </mesh>

      {/* 腹部浅色 */}
      <mesh material={bellyMat} position={[0, 0.18, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.7, 6, 10]} />
      </mesh>

      {/* 背部隆起 */}
      <mesh material={furMat} position={[-0.1, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.25, 8, 8]} />
      </mesh>

      {/* === 头部组 === */}
      <group ref={headRef} position={[0.6, 0.4, 0]}>
        {/* 头主体 - 方形带圆角 */}
        <mesh material={furMat} position={[0.15, 0.05, 0]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.32]} />
        </mesh>

        {/* 鼻吻部 - 突出且宽大 */}
        <mesh material={furMat} position={[0.42, -0.02, 0]} castShadow>
          <boxGeometry args={[0.25, 0.2, 0.28]} />
        </mesh>

        {/* 鼻子尖端 */}
        <mesh material={noseMat} position={[0.55, -0.02, 0]}>
          <sphereGeometry args={[0.065, 8, 8]} />
        </mesh>

        {/* 鼻孔 */}
        <mesh material={noseMat} position={[0.57, 0.01, 0.035]}>
          <sphereGeometry args={[0.025, 4, 4]} />
        </mesh>
        <mesh material={noseMat} position={[0.57, 0.01, -0.035]}>
          <sphereGeometry args={[0.025, 4, 4]} />
        </mesh>

        {/* 上嘴唇线 */}
        <mesh material={darkMat} position={[0.5, -0.08, 0]}>
          <boxGeometry args={[0.12, 0.02, 0.14]} />
        </mesh>

        {/* 眼睛 - 小且圆 */}
        <mesh material={eyeMat} position={[0.25, 0.12, 0.14]}>
          <sphereGeometry args={[0.045, 8, 8]} />
        </mesh>
        <mesh material={eyeHighlight} position={[0.28, 0.14, 0.16]}>
          <sphereGeometry args={[0.015, 4, 4]} />
        </mesh>

        <mesh material={eyeMat} position={[0.25, 0.12, -0.14]}>
          <sphereGeometry args={[0.045, 8, 8]} />
        </mesh>
        <mesh material={eyeHighlight} position={[0.28, 0.14, -0.16]}>
          <sphereGeometry args={[0.015, 4, 4]} />
        </mesh>

        {/* 眉毛隆起 */}
        <mesh material={darkMat} position={[0.22, 0.17, 0.14]} castShadow>
          <boxGeometry args={[0.1, 0.025, 0.06]} />
        </mesh>
        <mesh material={darkMat} position={[0.22, 0.17, -0.14]} castShadow>
          <boxGeometry args={[0.1, 0.025, 0.06]} />
        </mesh>

        {/* 耳朵 - 小而圆 */}
        <mesh material={furMat} position={[0.05, 0.22, 0.14]} rotation={[0, 0, -0.15]}>
          <sphereGeometry args={[0.06, 6, 6]} />
        </mesh>
        <mesh material={furMat} position={[0.05, 0.22, -0.14]} rotation={[0, 0, -0.15]}>
          <sphereGeometry args={[0.06, 6, 6]} />
        </mesh>

        {/* 脸颊毛发 */}
        <mesh material={bellyMat} position={[0.15, -0.05, 0.17]} castShadow>
          <sphereGeometry args={[0.07, 6, 6]} />
        </mesh>
        <mesh material={bellyMat} position={[0.15, -0.05, -0.17]} castShadow>
          <sphereGeometry args={[0.07, 6, 6]} />
        </mesh>
      </group>

      {/* 尾巴小突起 */}
      <mesh material={darkMat} position={[-0.5, 0.2, 0]}>
        <sphereGeometry args={[0.04, 6, 6]} />
      </mesh>

      {/* === 四条腿 - 粗壮 === */}
      <mesh material={darkMat} position={[0.28, 0.08, 0.2]} castShadow>
        <capsuleGeometry args={[0.07, 0.25, 4, 8]} />
      </mesh>
      <mesh material={darkMat} position={[0.28, 0.08, -0.2]} castShadow>
        <capsuleGeometry args={[0.07, 0.25, 4, 8]} />
      </mesh>
      <mesh material={darkMat} position={[-0.28, 0.08, 0.2]} castShadow>
        <capsuleGeometry args={[0.07, 0.25, 4, 8]} />
      </mesh>
      <mesh material={darkMat} position={[-0.28, 0.08, -0.2]} castShadow>
        <capsuleGeometry args={[0.07, 0.25, 4, 8]} />
      </mesh>

      {/* 脚趾 */}
      <mesh material={darkMat} position={[0.3, 0.01, 0.24]}>
        <boxGeometry args={[0.1, 0.03, 0.08]} />
      </mesh>
      <mesh material={darkMat} position={[0.3, 0.01, -0.24]}>
        <boxGeometry args={[0.1, 0.03, 0.08]} />
      </mesh>
      <mesh material={darkMat} position={[-0.3, 0.01, 0.24]}>
        <boxGeometry args={[0.1, 0.03, 0.08]} />
      </mesh>
      <mesh material={darkMat} position={[-0.3, 0.01, -0.24]}>
        <boxGeometry args={[0.1, 0.03, 0.08]} />
      </mesh>
    </group>
  );
}
