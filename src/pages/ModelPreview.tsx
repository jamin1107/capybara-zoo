import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CapybaraModelWithFallback } from '@/components/game/CapybaraModel';

export function ModelPreview() {
  return (
    <div className="w-screen h-screen bg-gray-900">
      <div className="p-4 text-center">
        <h1 className="text-white text-2xl font-bold mb-2">卡皮巴拉模型预览</h1>
        <p className="text-gray-400 text-sm mb-4">纯几何体模型 - 不依赖外部文件</p>
      </div>

      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="w-[600px] h-[500px] bg-gray-800 rounded-xl overflow-hidden relative">
          <div className="absolute top-3 left-3 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            当前模型 
          </div>
          <Canvas camera={{ position: [3, 2, 3], fov: 40 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
            <hemisphereLight args={[0x87ceeb, 0x4a7c3f, 0.3]} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
              <circleGeometry args={[3, 32]} />
              <meshStandardMaterial color={0x4a7c3f} />
            </mesh>
            <CapybaraModelWithFallback
              animation="idle"
              furColor="#8B5E3C"
              accessories={[]}
              scale={1.5}
            />
            <OrbitControls />
          </Canvas>
          <div className="absolute bottom-3 left-3 right-3 bg-black/60 text-white text-xs px-3 py-2 rounded-lg">
            桶形身体、方头平嘴、短粗腿、几乎无尾
          </div>
        </div>
      </div>

      <div className="text-center py-2">
        <p className="text-gray-500 text-xs">鼠标拖拽旋转查看 · 滚轮缩放</p>
      </div>
    </div>
  );
}
