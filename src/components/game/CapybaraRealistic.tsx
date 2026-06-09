import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CapybaraAnimation } from '@/types/game';

interface CapybaraRealisticProps {
  animation: CapybaraAnimation;
  onClick?: () => void;
}

/**
 * Realistic Capybara Model
 * Key capybara features:
 * - Blunt, flat-topped rectangular head
 * - Wide, squared-off snout
 * - Small eyes positioned HIGH on the sides
 * - Tiny ears on top of head near back
 * - Barrel body with humpback profile (high rump, lower shoulders)
 * - Short sturdy legs with slightly webbed feet
 * - Essentially no tail
 * - Almost no visible neck
 * - Reddish-brown fur on top, lighter tan underneath
 */
export function CapybaraRealistic({ animation, onClick }: CapybaraRealisticProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const leftFrontLeg = useRef<THREE.Group>(null!);
  const rightFrontLeg = useRef<THREE.Group>(null!);
  const leftBackLeg = useRef<THREE.Group>(null!);
  const rightBackLeg = useRef<THREE.Group>(null!);

  // === Colors ===
  // Real capybara: reddish-brown top, lighter tan underneath
  const topFurColor = useMemo(() => new THREE.Color(0x8B5E3C), []);
  const midFurColor = useMemo(() => new THREE.Color(0xA0724E), []);
  const bellyColor = useMemo(() => new THREE.Color(0xC4A882), []);
  const legColor = useMemo(() => new THREE.Color(0x6B4226), []);
  const noseColor = useMemo(() => new THREE.Color(0x2C1810), []);
  const eyeColor = useMemo(() => new THREE.Color(0x1a0e00), []);
  const earInnerColor = useMemo(() => new THREE.Color(0xB8856A), []);

  // === Materials ===
  const topFurMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: topFurColor, roughness: 0.9, flatShading: true }),
    [topFurColor]
  );
  const midFurMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: midFurColor, roughness: 0.85, flatShading: true }),
    [midFurColor]
  );
  const bellyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: bellyColor, roughness: 0.85, flatShading: true }),
    [bellyColor]
  );
  const legMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: legColor, roughness: 0.8, flatShading: true }),
    [legColor]
  );
  const noseMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: noseColor, roughness: 0.4 }),
    [noseColor]
  );
  const eyeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: eyeColor, roughness: 0.2 }),
    [eyeColor]
  );
  const eyeHighlightMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0xffffff }),
    []
  );
  const earInnerMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: earInnerColor, roughness: 0.75 }),
    [earInnerColor]
  );

  // === Animations ===
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Breathing - whole body gentle rise/fall
    if (bodyRef.current) {
      const breathY = Math.sin(t * 1.8) * 0.008;
      const breathScale = 1 + Math.sin(t * 1.8) * 0.012;
      bodyRef.current.position.y = breathY;
      bodyRef.current.scale.y = breathScale;
    }

    // Head animations
    if (headRef.current) {
      // Idle - gentle head tilt
      if (animation === 'idle' || animation === 'resting') {
        headRef.current.rotation.z = THREE.MathUtils.lerp(
          headRef.current.rotation.z,
          Math.sin(t * 0.7) * 0.03,
          delta * 2
        );
      }

      // Eating - head bobs down repeatedly
      if (animation === 'eating') {
        headRef.current.rotation.x = Math.sin(t * 4) * 0.2 + 0.1;
        headRef.current.position.y = THREE.MathUtils.lerp(
          headRef.current.position.y,
          -0.08 + Math.sin(t * 4) * 0.05,
          delta * 5
        );
      }

      // Resting - head droops down
      if (animation === 'resting') {
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          0.35,
          delta * 2
        );
        headRef.current.position.y = THREE.MathUtils.lerp(
          headRef.current.position.y,
          -0.05,
          delta * 2
        );
      }

      // Happy - enthusiastic head bob
      if (animation === 'happy') {
        headRef.current.rotation.x = Math.sin(t * 5) * 0.12;
        headRef.current.rotation.z = Math.sin(t * 3) * 0.08;
      }
    }

    // Walking - body bob
    if (groupRef.current && animation === 'walking') {
      groupRef.current.position.y = Math.abs(Math.sin(t * 5)) * 0.03;
    }

    // Leg animations
    const legAnim = (ref: typeof leftFrontLeg, target: number) => {
      if (ref.current) {
        ref.current.rotation.x = THREE.MathUtils.lerp(
          ref.current.rotation.x,
          target,
          delta * 10
        );
      }
    };

    if (animation === 'walking') {
      const cycle = t * 5;
      const lfAngle = Math.sin(cycle) * 0.4;
      const rfAngle = -lfAngle;
      legAnim(leftFrontLeg, lfAngle);
      legAnim(rightFrontLeg, rfAngle);
      legAnim(leftBackLeg, rfAngle);
      legAnim(rightBackLeg, lfAngle);
    } else {
      legAnim(leftFrontLeg, 0);
      legAnim(rightFrontLeg, 0);
      legAnim(leftBackLeg, 0);
      legAnim(rightBackLeg, 0);
    }

    // Happy bounce
    if (animation === 'happy' && groupRef.current) {
      groupRef.current.position.y += Math.abs(Math.sin(t * 6)) * 0.05;
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* ===== BODY GROUP ===== */}
      <group ref={bodyRef}>

        {/* === Main torso - barrel shape ===
            Capybara body is barrel-like, slightly wider at the rump
            CapsuleGeometry args: [radius, length, capSegments, radialSegments] */}
        <mesh material={topFurMat} position={[0, 0.52, 0]} castShadow>
          <capsuleGeometry args={[0.38, 0.7, 8, 14]} />
        </mesh>

        {/* Belly - lighter colored underside */}
        <mesh material={bellyMat} position={[0.05, 0.3, 0]} castShadow>
          <capsuleGeometry args={[0.28, 0.55, 6, 12]} />
        </mesh>

        {/* Humpback profile - capybara has higher rump than shoulders */}
        <mesh material={topFurMat} position={[-0.3, 0.72, 0]} castShadow>
          <sphereGeometry args={[0.25, 8, 8]} />
        </mesh>

        {/* Shoulder area - lower than rump */}
        <mesh material={topFurMat} position={[0.35, 0.65, 0]} castShadow>
          <sphereGeometry args={[0.22, 8, 8]} />
        </mesh>

        {/* Side fluff - capybara has wide barrel body */}
        <mesh material={midFurMat} position={[0.05, 0.52, 0.32]} castShadow>
          <sphereGeometry args={[0.15, 6, 6]} />
        </mesh>
        <mesh material={midFurMat} position={[0.05, 0.52, -0.32]} castShadow>
          <sphereGeometry args={[0.15, 6, 6]} />
        </mesh>

        {/* Rump - very round back end */}
        <mesh material={topFurMat} position={[-0.42, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.28, 8, 8]} />
        </mesh>

        {/* Chest/shoulder front */}
        <mesh material={midFurMat} position={[0.48, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.22, 8, 8]} />
        </mesh>

        {/* === HEAD - THE KEY CAPYBARA FEATURE ===
            Very blunt, wide, flat-topped rectangular head
            Almost no visible neck */}
        <group ref={headRef} position={[0.58, 0.6, 0]}>

          {/* Main head - flat-topped box with rounded edges
              This is the distinctive capybara shape */}
          <mesh material={topFurMat} position={[0.12, 0.02, 0]} castShadow>
            <boxGeometry args={[0.42, 0.28, 0.3]} />
          </mesh>

          {/* Top of head - very flat, capybara signature */}
          <mesh material={topFurMat} position={[0.12, 0.17, 0]}>
            <boxGeometry args={[0.38, 0.04, 0.28]} />
          </mesh>

          {/* Face front - blunt and flat */}
          <mesh material={midFurMat} position={[0.34, -0.01, 0]}>
            <boxGeometry args={[0.04, 0.26, 0.28]} />
          </mesh>

          {/* === SNOUT - Wide, blunt, squared-off === */}
          {/* Snout base - wide and flat */}
          <mesh material={topFurMat} position={[0.42, -0.02, 0]} castShadow>
            <boxGeometry args={[0.18, 0.18, 0.26]} />
          </mesh>

          {/* Snout bottom - slightly rounded */}
          <mesh material={bellyMat} position={[0.42, -0.1, 0]}>
            <capsuleGeometry args={[0.09, 0.08, 4, 8]} />
          </mesh>

          {/* NOSE - Large, flat, prominent nostrils
              Capybaras have wide, flat noses */}
          <mesh material={noseMat} position={[0.52, 0.02, 0]}>
            <boxGeometry args={[0.04, 0.08, 0.18]} />
          </mesh>

          {/* Nostrils - prominent, wide-set */}
          <mesh material={noseMat} position={[0.54, 0.05, 0.055]}>
            <sphereGeometry args={[0.022, 6, 6]} />
          </mesh>
          <mesh material={noseMat} position={[0.54, 0.05, -0.055]}>
            <sphereGeometry args={[0.022, 6, 6]} />
          </mesh>

          {/* Mouth line - subtle */}
          <mesh material={new THREE.MeshStandardMaterial({ color: 0x4A3020 })} position={[0.48, -0.08, 0]}>
            <boxGeometry args={[0.06, 0.012, 0.1]} />
          </mesh>

          {/* Lower lip area */}
          <mesh material={bellyMat} position={[0.46, -0.12, 0]}>
            <boxGeometry args={[0.08, 0.03, 0.12]} />
          </mesh>

          {/* === EYES - Small, HIGH on the sides of head ===
              This is a KEY capybara feature - eyes sit high and to the sides */}
          {/* Left eye */}
          <mesh material={eyeMat} position={[0.22, 0.1, 0.16]}>
            <sphereGeometry args={[0.035, 8, 8]} />
          </mesh>
          <mesh material={eyeHighlightMat} position={[0.25, 0.11, 0.175]}>
            <sphereGeometry args={[0.012, 4, 4]} />
          </mesh>

          {/* Right eye */}
          <mesh material={eyeMat} position={[0.22, 0.1, -0.16]}>
            <sphereGeometry args={[0.035, 8, 8]} />
          </mesh>
          <mesh material={eyeHighlightMat} position={[0.25, 0.11, -0.175]}>
            <sphereGeometry args={[0.012, 4, 4]} />
          </mesh>

          {/* Eyebrow ridge - subtle */}
          <mesh material={new THREE.MeshStandardMaterial({ color: 0x5C3A1E, roughness: 0.8 })}
                position={[0.2, 0.13, 0.14]}>
            <boxGeometry args={[0.07, 0.018, 0.05]} />
          </mesh>
          <mesh material={new THREE.MeshStandardMaterial({ color: 0x5C3A1E, roughness: 0.8 })}
                position={[0.2, 0.13, -0.14]}>
            <boxGeometry args={[0.07, 0.018, 0.05]} />
          </mesh>

          {/* Cheek fluff - fuller cheeks */}
          <mesh material={bellyMat} position={[0.28, -0.06, 0.18]} castShadow>
            <sphereGeometry args={[0.06, 6, 6]} />
          </mesh>
          <mesh material={bellyMat} position={[0.28, -0.06, -0.18]} castShadow>
            <sphereGeometry args={[0.06, 6, 6]} />
          </mesh>

          {/* === EARS - Very small, on TOP of head near the back === */}
          {/* Left ear */}
          <group position={[0.02, 0.2, 0.14]}>
            <mesh material={topFurMat} rotation={[0.1, 0.15, -0.2]}>
              <sphereGeometry args={[0.045, 6, 6]} />
            </mesh>
            <mesh material={earInnerMat} position={[0, 0, 0.008]}>
              <sphereGeometry args={[0.025, 6, 6]} />
            </mesh>
          </group>

          {/* Right ear */}
          <group position={[0.02, 0.2, -0.14]}>
            <mesh material={topFurMat} rotation={[0.1, -0.15, 0.2]}>
              <sphereGeometry args={[0.045, 6, 6]} />
            </mesh>
            <mesh material={earInnerMat} position={[0, 0, -0.008]}>
              <sphereGeometry args={[0.025, 6, 6]} />
            </mesh>
          </group>
        </group>

        {/* Neck area - almost invisible, smooth transition */}
        <mesh material={topFurMat} position={[0.48, 0.55, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.06, 4, 8]} />
        </mesh>

        {/* === TAIL - essentially non-existent === */}
        {/* Tiny nub - capybaras barely have a tail */}
        <mesh material={legMat} position={[-0.55, 0.45, 0]}>
          <sphereGeometry args={[0.02, 4, 4]} />
        </mesh>

        {/* === LEGS - Short, sturdy, with slightly webbed feet === */}
        {/* Capybara legs are relatively short but thick */}

        {/* Left Front Leg */}
        <group ref={leftFrontLeg} position={[0.3, 0.15, 0.2]}>
          <mesh material={legMat} position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.22, 4, 8]} />
          </mesh>
          {/* Foot - slightly wider to suggest webbing */}
          <mesh material={legMat} position={[0.02, -0.24, 0]} castShadow>
            <boxGeometry args={[0.1, 0.03, 0.09]} />
          </mesh>
        </group>

        {/* Right Front Leg */}
        <group ref={rightFrontLeg} position={[0.3, 0.15, -0.2]}>
          <mesh material={legMat} position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.22, 4, 8]} />
          </mesh>
          <mesh material={legMat} position={[0.02, -0.24, 0]} castShadow>
            <boxGeometry args={[0.1, 0.03, 0.09]} />
          </mesh>
        </group>

        {/* Left Back Leg - slightly thicker than front */}
        <group ref={leftBackLeg} position={[-0.25, 0.15, 0.2]}>
          <mesh material={legMat} position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.22, 4, 8]} />
          </mesh>
          <mesh material={legMat} position={[0.02, -0.24, 0]} castShadow>
            <boxGeometry args={[0.1, 0.03, 0.09]} />
          </mesh>
        </group>

        {/* Right Back Leg */}
        <group ref={rightBackLeg} position={[-0.25, 0.15, -0.2]}>
          <mesh material={legMat} position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.22, 4, 8]} />
          </mesh>
          <mesh material={legMat} position={[0.02, -0.24, 0]} castShadow>
            <boxGeometry args={[0.1, 0.03, 0.09]} />
          </mesh>
        </group>

      </group>
    </group>
  );
}
