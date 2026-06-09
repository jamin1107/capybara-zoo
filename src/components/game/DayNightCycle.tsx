import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

interface DayNightConfig {
  skyTop: THREE.Color;
  skyBottom: THREE.Color;
  ambientColor: THREE.Color;
  ambientIntensity: number;
  dirColor: THREE.Color;
  dirIntensity: number;
  dirPosition: [number, number, number];
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  bloomThreshold: number;
  bloomIntensity: number;
  starsOpacity: number;
}

function getConfigForHour(hour: number, minute: number): DayNightConfig {
  const time = hour + minute / 60;

  const configs: { time: number; config: Partial<DayNightConfig> }[] = [
    {
      time: 0,
      config: {
        skyTop: new THREE.Color('#0a0a2e'),
        skyBottom: new THREE.Color('#1a1a3e'),
        ambientColor: new THREE.Color('#223366'),
        ambientIntensity: 0.15,
        dirColor: new THREE.Color('#334488'),
        dirIntensity: 0.3,
        dirPosition: [0, -5, 0],
        hemiSky: new THREE.Color('#0a0a2e'),
        hemiGround: new THREE.Color('#1a1a3e'),
        bloomThreshold: 0.2,
        bloomIntensity: 0.3,
        starsOpacity: 1.0,
      },
    },
    {
      time: 5,
      config: {
        skyTop: new THREE.Color('#1a1a4e'),
        skyBottom: new THREE.Color('#4a3a6e'),
        ambientColor: new THREE.Color('#334477'),
        ambientIntensity: 0.2,
        dirColor: new THREE.Color('#886644'),
        dirIntensity: 0.4,
        dirPosition: [-10, 2, 5],
        hemiSky: new THREE.Color('#3a2a5e'),
        hemiGround: new THREE.Color('#2a3a2e'),
        bloomThreshold: 0.3,
        bloomIntensity: 0.25,
        starsOpacity: 0.7,
      },
    },
    {
      time: 6,
      config: {
        skyTop: new THREE.Color('#FF8C42'),
        skyBottom: new THREE.Color('#FFD700'),
        ambientColor: new THREE.Color('#FF9966'),
        ambientIntensity: 0.35,
        dirColor: new THREE.Color('#FF8C42'),
        dirIntensity: 0.7,
        dirPosition: [-12, 3, 8],
        hemiSky: new THREE.Color('#FF6B35'),
        hemiGround: new THREE.Color('#4a6c3f'),
        bloomThreshold: 0.5,
        bloomIntensity: 0.35,
        starsOpacity: 0.3,
      },
    },
    {
      time: 8,
      config: {
        skyTop: new THREE.Color('#87CEEB'),
        skyBottom: new THREE.Color('#E0F7FA'),
        ambientColor: new THREE.Color('#FFFFFF'),
        ambientIntensity: 0.6,
        dirColor: new THREE.Color('#FFFFFF'),
        dirIntensity: 1.0,
        dirPosition: [-5, 10, 8],
        hemiSky: new THREE.Color('#87ceeb'),
        hemiGround: new THREE.Color('#4a7c3f'),
        bloomThreshold: 0.8,
        bloomIntensity: 0.15,
        starsOpacity: 0,
      },
    },
    {
      time: 12,
      config: {
        skyTop: new THREE.Color('#4A90D9'),
        skyBottom: new THREE.Color('#87CEEB'),
        ambientColor: new THREE.Color('#FFFFFF'),
        ambientIntensity: 0.7,
        dirColor: new THREE.Color('#FFF8E7'),
        dirIntensity: 1.3,
        dirPosition: [0, 15, 0],
        hemiSky: new THREE.Color('#4A90D9'),
        hemiGround: new THREE.Color('#4a7c3f'),
        bloomThreshold: 0.85,
        bloomIntensity: 0.1,
        starsOpacity: 0,
      },
    },
    {
      time: 17,
      config: {
        skyTop: new THREE.Color('#6B4C9A'),
        skyBottom: new THREE.Color('#FF6B6B'),
        ambientColor: new THREE.Color('#FF8866'),
        ambientIntensity: 0.4,
        dirColor: new THREE.Color('#FF6B35'),
        dirIntensity: 0.8,
        dirPosition: [10, 4, 10],
        hemiSky: new THREE.Color('#FF6B35'),
        hemiGround: new THREE.Color('#3a5c2f'),
        bloomThreshold: 0.5,
        bloomIntensity: 0.3,
        starsOpacity: 0.1,
      },
    },
    {
      time: 19,
      config: {
        skyTop: new THREE.Color('#2a1a4e'),
        skyBottom: new THREE.Color('#4a2a6e'),
        ambientColor: new THREE.Color('#443377'),
        ambientIntensity: 0.25,
        dirColor: new THREE.Color('#6655aa'),
        dirIntensity: 0.4,
        dirPosition: [12, 2, -5],
        hemiSky: new THREE.Color('#2a1a4e'),
        hemiGround: new THREE.Color('#1a2a3e'),
        bloomThreshold: 0.3,
        bloomIntensity: 0.35,
        starsOpacity: 0.5,
      },
    },
    {
      time: 21,
      config: {
        skyTop: new THREE.Color('#0a0a2e'),
        skyBottom: new THREE.Color('#1a1a3e'),
        ambientColor: new THREE.Color('#223366'),
        ambientIntensity: 0.15,
        dirColor: new THREE.Color('#4466aa'),
        dirIntensity: 0.3,
        dirPosition: [0, -5, -10],
        hemiSky: new THREE.Color('#0a0a2e'),
        hemiGround: new THREE.Color('#1a1a3e'),
        bloomThreshold: 0.2,
        bloomIntensity: 0.35,
        starsOpacity: 0.9,
      },
    },
  ];

  // Interpolate between configs
  let prev = configs[0];
  let next = configs[1];

  for (let i = 0; i < configs.length - 1; i++) {
    if (time >= configs[i].time && time < configs[i + 1].time) {
      prev = configs[i];
      next = configs[i + 1];
      break;
    }
  }

  if (time >= configs[configs.length - 1].time) {
    prev = configs[configs.length - 1];
    next = configs[0];
  }

  const t = (time - prev.time) / ((next.time > prev.time ? next.time : next.time + 24) - prev.time);
  const smoothT = t * t * (3 - 2 * t); // smoothstep

  const p = prev.config;
  const n = next.config;

  return {
    skyTop: p.skyTop!.clone().lerp(n.skyTop!, smoothT),
    skyBottom: p.skyBottom!.clone().lerp(n.skyBottom!, smoothT),
    ambientColor: p.ambientColor!.clone().lerp(n.ambientColor!, smoothT),
    ambientIntensity: p.ambientIntensity! + (n.ambientIntensity! - p.ambientIntensity!) * smoothT,
    dirColor: p.dirColor!.clone().lerp(n.dirColor!, smoothT),
    dirIntensity: p.dirIntensity! + (n.dirIntensity! - p.dirIntensity!) * smoothT,
    dirPosition: [
      p.dirPosition![0] + (n.dirPosition![0] - p.dirPosition![0]) * smoothT,
      p.dirPosition![1] + (n.dirPosition![1] - p.dirPosition![1]) * smoothT,
      p.dirPosition![2] + (n.dirPosition![2] - p.dirPosition![2]) * smoothT,
    ] as [number, number, number],
    hemiSky: p.hemiSky!.clone().lerp(n.hemiSky!, smoothT),
    hemiGround: p.hemiGround!.clone().lerp(n.hemiGround!, smoothT),
    bloomThreshold: p.bloomThreshold! + (n.bloomThreshold! - p.bloomThreshold!) * smoothT,
    bloomIntensity: p.bloomIntensity! + (n.bloomIntensity! - p.bloomIntensity!) * smoothT,
    starsOpacity: p.starsOpacity! + (n.starsOpacity! - p.starsOpacity!) * smoothT,
  };
}

export function DayNightCycle() {
  const gameHour = useGameStore((state) => state.gameHour);
  const gameMinute = useGameStore((state) => state.gameMinute);
  const ambientRef = useRef<THREE.AmbientLight>(null!);
  const dirRef = useRef<THREE.DirectionalLight>(null!);
  const hemiRef = useRef<THREE.HemisphereLight>(null!);
  const sunMoonRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    const config = getConfigForHour(gameHour, gameMinute);

    if (ambientRef.current) {
      ambientRef.current.color.copy(config.ambientColor);
      ambientRef.current.intensity = config.ambientIntensity;
    }
    if (dirRef.current) {
      dirRef.current.color.copy(config.dirColor);
      dirRef.current.intensity = config.dirIntensity;
      dirRef.current.position.set(...config.dirPosition);
    }
    if (hemiRef.current) {
      hemiRef.current.color.copy(config.hemiSky);
      hemiRef.current.groundColor.copy(config.hemiGround);
    }
    if (sunMoonRef.current) {
      const totalMinutes = gameHour * 60 + gameMinute;
      const angle = ((totalMinutes / 1440) * Math.PI * 2) - Math.PI / 2;
      const radius = 20;
      sunMoonRef.current.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      );

      const isNight = gameHour >= 19 || gameHour < 6;
      const sunColor = isNight ? new THREE.Color('#E8E8F0') : new THREE.Color('#FFD700');
      (sunMoonRef.current.material as THREE.MeshStandardMaterial).color.copy(sunColor);
      const scale = isNight ? 0.8 : 1.2;
      sunMoonRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.5} />
      <directionalLight
        ref={dirRef}
        position={[0, 10, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight ref={hemiRef} args={[0x87ceeb, 0x4a7c3f, 0.3]} />
      {/* Sun/Moon object */}
      <mesh ref={sunMoonRef}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial emissive="#FFD700" emissiveIntensity={0.8} />
      </mesh>
    </>
  );
}
