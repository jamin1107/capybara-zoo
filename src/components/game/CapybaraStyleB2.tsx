import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 风格B2 - 圆润卡皮巴拉（改进版）
 * 保留圆润可爱的整体感觉，但加入更多卡皮巴拉的标志性特征：
 * 方头方脑、大鼻吻、小圆耳、桶形身体、几乎无尾巴
 */
export function CapybaraStyleB2() {
  const groupRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);

  // 卡皮巴拉经典毛色
  const furColor = useMemo(() => new THREE.Color(0xA0784C), []);
  const darkFur = useMemo(() => new THREE.Color(0x6B4226), []);
  const lightFur = useMemo(() => new THREE.Color(0xC4A67D), []);
  const noseColor = useMemo(() => new THREE.Color(0x2C1810), []);
  const eyeColor = useMemo(() => new THREE.Color(0x1a0e00), []);

  const furMat = useMemo(() => new THREE.MeshStandardMaterial({ color: furColor, roughness: 0.85, flatShading: true }), [furColor]);
  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: darkFur, roughness: 0.75, flatShading: true }), [darkFur]);
  const lightMat = useMemo(() => new THREE.MeshStandardMaterial({ color: lightFur, roughness: 0.8, flatShading: true }), [lightFur]);
  const noseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: noseColor, roughness: 0.5 }), [noseColor]);
  const eyeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: eyeColor, roughness: 0.2 }), [eyeColor]);
  const eyeHL = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xffffff }), []);
  const earInner = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color(0xD4A080), roughness: 0.8 }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // 轻微呼吸浮动
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.012;
    }
    if (headRef.current) {
      // 头部轻微摇摆
      headRef.current.rotation.z = Math.sin(t * 0.8) * 0.02;
      headRef.current.position.y = Math.sin(t * 1.5 + 0.5) * 0.006;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.05, 0]}>
      {/* ===== 身体 - 桶形（长圆柱）===== */}
      {/* 主躯干 - 用胶囊体做桶形身体 */}
      <mesh material={furMat} position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.35, 0.6, 6, 12]} />
      </mesh>

      {/* 腹部浅色区域 */}
      <mesh material={lightMat} position={[0.05, 0.25, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.5, 4, 10]} />
      </mesh>

      {/* 背部微微隆起 */}
      <mesh material={furMat} position={[-0.05, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
      </mesh>

      {/* 臀部圆润 */}
      <mesh material={furMat} position={[-0.4, 0.4, 0]} castShadow>
        <sphereGeometry args={[0.28, 8, 8]} />
      </mesh>

      {/* ===== 头部组 - 方形长方体 ===== */}
      <group ref={headRef} position={[0.55, 0.45, 0]}>
        {/* 头部主体 - 长方体，这是卡皮巴拉的关键特征 */}
        <mesh material={furMat} position={[0.12, 0.05, 0]} castShadow>
          <boxGeometry args={[0.45, 0.32, 0.32]} />
        </mesh>

        {/* 脸颊 - 圆润过渡 */}
        <mesh material={lightMat} position={[0.2, -0.05, 0.14]} castShadow>
          <sphereGeometry args={[0.1, 8, 6]} />
        </mesh>
        <mesh material={lightMat} position={[0.2, -0.05, -0.14]} castShadow>
          <sphereGeometry args={[0.1, 8, 6]} />
        </mesh>

        {/* === 大鼻吻部 - 卡皮巴拉标志性特征 === */}
        {/* 鼻吻主体 - 宽阔突出 */}
        <mesh material={furMat} position={[0.42, -0.02, 0]} castShadow>
          <boxGeometry args={[0.22, 0.22, 0.28]} />
        </mesh>

        {/* 鼻吻底部圆润 */}
        <mesh material={lightMat} position={[0.42, -0.12, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.12, 4, 8]} />
        </mesh>

        {/* 大鼻子 - 扁平湿润的鼻头 */}
        <mesh material={noseMat} position={[0.54, 0.02, 0]}>
          <boxGeometry args={[0.06, 0.1, 0.2]} />
        </mesh>

        {/* 鼻孔 - 两个小圆 */}
        <mesh material={noseMat} position={[0.56, 0.05, 0.05]}>
          <sphereGeometry args={[0.025, 6, 6]} />
        </mesh>
        <mesh material={noseMat} position={[0.56, 0.05, -0.05]}>
          <sphereGeometry args={[0.025, 6, 6]} />
        </mesh>

        {/* 嘴巴 */}
        <mesh material={darkMat} position={[0.5, -0.1, 0]}>
          <boxGeometry args={[0.06, 0.015, 0.12]} />
        </mesh>

        {/* === 眼睛 - 小而圆，位置偏高偏侧 === */}
        <mesh material={eyeMat} position={[0.2, 0.14, 0.15]}>
          <sphereGeometry args={[0.04, 8, 8]} />
        </mesh>
        <mesh material={eyeHL} position={[0.23, 0.16, 0.17]}>
          <sphereGeometry args={[0.015, 4, 4]} />
        </mesh>

        <mesh material={eyeMat} position={[0.2, 0.14, -0.15]}>
          <sphereGeometry args={[0.04, 8, 8]} />
        </mesh>
        <mesh material={eyeHL} position={[0.23, 0.16, -0.17]}>
          <sphereGeometry args={[0.015, 4, 4]} />
        </mesh>

        {/* 眉毛隆起 */}
        <mesh material={darkMat} position={[0.18, 0.2, 0.14]} castShadow>
          <boxGeometry args={[0.08, 0.02, 0.06]} />
        </mesh>
        <mesh material={darkMat} position={[0.18, 0.2, -0.14]} castShadow>
          <boxGeometry args={[0.08, 0.02, 0.06]} />
        </mesh>

        {/* === 耳朵 - 小圆耳，头顶两侧 === */}
        <group position={[0, 0.2, 0.16]}>
          <mesh material={furMat} rotation={[0, 0, -0.15]}>
            <sphereGeometry args={[0.055, 6, 6]} />
          </mesh>
          <mesh material={earInner} position={[0, 0, 0.01]}>
            <sphereGeometry args={[0.03, 6, 6]} />
          </mesh>
        </group>
        <group position={[0, 0.2, -0.16]}>
          <mesh material={furMat} rotation={[0, 0, -0.15]}>
            <sphereGeometry args={[0.055, 6, 6]} />
          </mesh>
          <mesh material={earInner} position={[0, 0, 0.01]}>
            <sphereGeometry args={[0.03, 6, 6]} />
          </mesh>
        </group>
      </group>

      {/* 脖子连接 */}
      <mesh material={furMat} position={[0.4, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.15, 4, 8]} />
      </mesh>

      {/* 尾巴 - 几乎看不见的小突起 */}
      <mesh material={darkMat} position={[-0.55, 0.35, 0]}>
        <sphereGeometry args={[0.025, 4, 4]} />
      </mesh>

      {/* ===== 四条腿 - 短粗 ===== */}
      {/* 前腿 */}
      <group position={[0.25, 0.1, 0.18]}>
        <mesh material={darkMat} castShadow>
          <capsuleGeometry args={[0.065, 0.22, 4, 8]} />
        </mesh>
        {/* 脚掌 */}
        <mesh material={darkMat} position={[0.02, -0.12, 0]}>
          <boxGeometry args={[0.1, 0.03, 0.08]} />
        </mesh>
      </group>

      <group position={[0.25, 0.1, -0.18]}>
        <mesh material={darkMat} castShadow>
          <capsuleGeometry args={[0.065, 0.22, 4, 8]} />
        </mesh>
        <mesh material={darkMat} position={[0.02, -0.12, 0]}>
          <boxGeometry args={[0.1, 0.03, 0.08]} />
        </mesh>
      </group>

      {/* 后腿 */}
      <group position={[-0.25, 0.1, 0.18]}>
        <mesh material={darkMat} castShadow>
          <capsuleGeometry args={[0.065, 0.22, 4, 8]} />
        </mesh>
        <mesh material={darkMat} position={[0.02, -0.12, 0]}>
          <boxGeometry args={[0.1, 0.03, 0.08]} />
        </mesh>
      </group>

      <group position={[-0.25, 0.1, -0.18]}>
        <mesh material={darkMat} castShadow>
          <capsuleGeometry args={[0.065, 0.22, 4, 8]} />
        </mesh>
        <mesh material={darkMat} position={[0.02, -0.12, 0]}>
          <boxGeometry args={[0.1, 0.03, 0.08]} />
        </mesh>
      </group>
    </group>
  );
}
