import { useRef, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, SEEDS_DATA } from '@/store/gameStore';
import type { CropStage, FarmTool, CropType } from '@/types/game';

const SEED_MAP: Record<CropType, { icon: string; color: string; name: string }> = {
  lettuce: { icon: '🥬', color: '#8BC34A', name: '生菜' },
  carrot: { icon: '🥕', color: '#FF9800', name: '胡萝卜' },
  tomato: { icon: '🍅', color: '#F44336', name: '番茄' },
  corn: { icon: '🌽', color: '#FFEB3B', name: '玉米' },
  potato: { icon: '🥔', color: '#D4A574', name: '土豆' },
};

const STAGE_COLORS: Record<CropStage, string> = {
  seed: '#8B5E3C',
  sprout: '#66BB6A',
  growing: '#43A047',
  mature: '#2E7D32',
  withered: '#8D6E63',
};

const STAGE_SCALE: Record<CropStage, number> = {
  seed: 0.1,
  sprout: 0.3,
  growing: 0.6,
  mature: 1.0,
  withered: 0.7,
};

/** 单个农场格子组件 */
function PlotBlock({
  plotId,
  worldPos,
  cropType,
  stage,
  growthProgress,
  fertilized,
}: {
  plotId: string;
  worldPos: [number, number, number];
  cropType: CropType | null;
  stage: CropStage;
  growthProgress: number;
  fertilized: boolean;
}) {
  const meshRef = useRef<THREE.Group>(null!);
  const hoverRef = useRef(false);

  const selectedTool = useGameStore((s) => s.selectedTool);
  const selectedSeed = useGameStore((s) => s.selectedSeed);
  const selectedPlotId = useGameStore((s) => s.selectedPlotId);
  const gold = useGameStore((s) => s.gold);
  const selectPlot = useGameStore((s) => s.selectPlot);
  const plantSeed = useGameStore((s) => s.plantSeed);
  const waterCrop = useGameStore((s) => s.waterCrop);
  const fertilizeCrop = useGameStore((s) => s.fertilizeCrop);
  const harvestCrop = useGameStore((s) => s.harvestCrop);

  // 根据土壤水分显示不同颜色
  const soilColor = useMemo(() => {
    if (!cropType) {
      // 空地 - 根据是否潮湿显示不同颜色
      return '#8B6914';
    }
    // 有作物 - 根据水分显示深浅
    const plot = useGameStore.getState().farmPlots.find((p) => p.id === plotId);
    if (!plot) return '#6B4226';
    const moisture = plot.waterLevel / 100;
    const r = Math.floor(0x6B + (0x4A - 0x6B) * moisture);
    const g = Math.floor(0x42 + (0x28 - 0x42) * moisture);
    const b = Math.floor(0x26 + (0x14 - 0x26) * moisture);
    return `rgb(${r},${g},${b})`;
  }, [cropType, plotId]);

  useFrame((state) => {
    if (meshRef.current && cropType && stage !== 'withered') {
      // 成熟作物轻微摆动
      const time = state.clock.getElapsedTime();
      if (stage === 'mature') {
        meshRef.current.rotation.z = Math.sin(time * 1.5) * 0.03;
      }
    }
  });

  const handlePlotClick = useCallback(() => {
    if (!selectedTool && !selectedSeed) {
      // 没有选择工具/种子 - 选中/取消选中
      selectPlot(selectedPlotId === plotId ? null : plotId);
      return;
    }

    if (selectedSeed && !cropType) {
      // 种植
      const seedData = SEEDS_DATA.find((s) => s.cropType === selectedSeed);
      if (seedData && gold >= seedData.cost) {
        plantSeed(plotId, selectedSeed);
      }
    } else if (selectedTool === 'water' && cropType && stage !== 'withered') {
      // 浇水
      waterCrop(plotId);
    } else if (selectedTool === 'fertilizer' && cropType && stage !== 'withered' && !fertilized) {
      // 施肥
      fertilizeCrop(plotId);
    } else if (selectedTool === 'harvest' && stage === 'mature') {
      // 收获
      harvestCrop(plotId);
    } else if (selectedTool === 'hoe' && cropType) {
      // 锄头 - 清除枯萎作物
      if (stage === 'withered') {
        // 复用收获逻辑清除
        harvestCrop(plotId);
      }
    }
  }, [selectedTool, selectedSeed, cropType, stage, fertilized, plotId, gold, selectPlot, plantSeed, waterCrop, fertilizeCrop, harvestCrop]);

  const isSelected = selectedPlotId === plotId;
  const seedInfo = cropType ? SEED_MAP[cropType] : null;

  return (
    <group ref={meshRef} position={worldPos} onClick={handlePlotClick}>
      {/* 土地 */}
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[1.3, 0.05, 1.3]} />
        <meshStandardMaterial color={soilColor} roughness={0.9} />
      </mesh>

      {/* 高亮边框 */}
      {(isSelected || hoverRef.current) && (
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[1.35, 0.02, 1.35]} />
          <meshStandardMaterial
            color={isSelected ? '#FFD700' : '#FFFFFF'}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {/* 作物 */}
      {cropType && (
        <>
          {stage !== 'seed' && (
            // 植物主体
            <group position={[0, 0.1, 0]}>
              <mesh castShadow>
                {stage === 'withered' ? (
                  <coneGeometry args={[0.15, 0.3, 4]} />
                ) : (
                  <sphereGeometry args={[0.2, 8, 8]} />
                )}
                <meshStandardMaterial
                  color={STAGE_COLORS[stage]}
                  roughness={0.8}
                />
              </mesh>

              {/* 成熟作物的果实 */}
              {stage === 'mature' && seedInfo && (
                <>
                  <mesh position={[0, 0.3, 0]} castShadow>
                    <sphereGeometry args={[0.12, 8, 8]} />
                    <meshStandardMaterial color={seedInfo.color} roughness={0.5} />
                  </mesh>
                  <mesh position={[0.15, 0.15, 0]} castShadow>
                    <sphereGeometry args={[0.08, 6, 6]} />
                    <meshStandardMaterial color={seedInfo.color} roughness={0.5} />
                  </mesh>
                  <mesh position={[-0.12, 0.2, 0.1]} castShadow>
                    <sphereGeometry args={[0.08, 6, 6]} />
                    <meshStandardMaterial color={seedInfo.color} roughness={0.5} />
                  </mesh>
                </>
              )}

              {/* 植物茎 */}
              {stage !== 'withered' && (
                <mesh position={[0, -0.1, 0]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.2, 6]} />
                  <meshStandardMaterial color="#4CAF50" />
                </mesh>
              )}
            </group>
          )}

          {/* 种子状态 - 小圆点 */}
          {stage === 'seed' && (
            <mesh position={[0, 0.05, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color={STAGE_COLORS.seed} />
            </mesh>
          )}

          {/* 施肥标记 */}
          {fertilized && stage !== 'withered' && (
            <Text
              position={[0.3, 0.4, 0]}
              fontSize={0.15}
              color="#FFD700"
              anchorX="center"
              anchorY="middle"
            >
              ✨
            </Text>
          )}

          {/* 成熟标记 - 感叹号 */}
          {stage === 'mature' && (
            <Text
              position={[0, 0.55, 0]}
              fontSize={0.25}
              color="#FFD700"
              anchorX="center"
              anchorY="middle"
            >
              ⚡
            </Text>
          )}

          {/* 枯萎标记 */}
          {stage === 'withered' && (
            <Text
              position={[0, 0.35, 0]}
              fontSize={0.2}
              color="#795548"
              anchorX="center"
              anchorY="middle"
            >
              💀
            </Text>
          )}
        </>
      )}

      {/* 悬停高亮 */}
      <mesh
        position={[0, 0.03, 0]}
        onPointerOver={() => { hoverRef.current = true; }}
        onPointerOut={() => { hoverRef.current = false; }}
        visible={false}
      >
        <boxGeometry args={[1.3, 0.01, 1.3]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

/** 农场网格整体 */
export function FarmScene() {
  const farmPlots = useGameStore((s) => s.farmPlots);
  const farmMode = useGameStore((s) => s.farmMode);

  if (!farmMode) return null;

  return (
    <group position={[0, 0.05, 4]}>
      {/* 农场基底 */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[7, 0.1, 5.5]} />
        <meshStandardMaterial color="#5D4037" roughness={1} />
      </mesh>

      {/* 围栏 */}
      <mesh position={[0, 0.15, -2.5]}>
        <boxGeometry args={[7.2, 0.3, 0.08]} />
        <meshStandardMaterial color="#8D6E63" />
      </mesh>
      <mesh position={[0, 0.15, 2.5]}>
        <boxGeometry args={[7.2, 0.3, 0.08]} />
        <meshStandardMaterial color="#8D6E63" />
      </mesh>
      <mesh position={[-3.5, 0.15, 0]}>
        <boxGeometry args={[0.08, 0.3, 5.2]} />
        <meshStandardMaterial color="#8D6E63" />
      </mesh>
      <mesh position={[3.5, 0.15, 0]}>
        <boxGeometry args={[0.08, 0.3, 5.2]} />
        <meshStandardMaterial color="#8D6E63" />
      </mesh>

      {/* 农场标题 */}
      <Text
        position={[0, 0.5, -2.8]}
        fontSize={0.35}
        color="#8D6E63"
        anchorX="center"
        anchorY="middle"
        font="sans-serif"
      >
        🌾 卡皮巴拉农场
      </Text>

      {/* 格子 */}
      {farmPlots.map((plot) => (
        <PlotBlock
          key={plot.id}
          plotId={plot.id}
          worldPos={plot.worldPosition}
          cropType={plot.cropType}
          stage={plot.stage}
          growthProgress={plot.growthProgress}
          fertilized={plot.fertilized}
        />
      ))}
    </group>
  );
}
