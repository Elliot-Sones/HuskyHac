import { Suspense } from 'react';
import type { ComponentType } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, KeyboardControls, Loader, PerspectiveCamera } from '@react-three/drei';
import type { ConversationStatus, SceneMode } from '@/shared/contracts';
import { PlayerController } from '@/world/PlayerController';
import type {
  WorldConversationFocus,
  WorldLayout,
  WorldSceneProps,
  WorldTransitTarget,
} from '@/world/worldLayout';

interface WorldCanvasProps {
  mode: SceneMode;
  layout: WorldLayout;
  Scene: ComponentType<WorldSceneProps>;
  isNearNpc: boolean;
  conversationStatus: ConversationStatus;
  onNearNpcChange: (near: boolean) => void;
  onNearTransitChange: (target: WorldTransitTarget | null) => void;
  onInteract: () => void;
  onTransitInteract: (target: WorldTransitTarget) => void;
  conversationFocus?: WorldConversationFocus | null;
}

const keyMap = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
  { name: 'run', keys: ['Shift'] },
];

export function WorldCanvas({
  mode,
  layout,
  Scene,
  isNearNpc,
  conversationStatus,
  onNearNpcChange,
  onNearTransitChange,
  onInteract,
  onTransitInteract,
  conversationFocus = null,
}: WorldCanvasProps) {
  return (
    <div data-testid="world-canvas-host" className="absolute inset-0">
      <KeyboardControls map={keyMap}>
        <Canvas
          data-testid="world-canvas"
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 4.8, 15], fov: 48 }}
          gl={{ antialias: true, preserveDrawingBuffer: true, toneMappingExposure: 1.08 }}
        >
          <color attach="background" args={[layout.skyColor]} />
          <fog attach="fog" args={[layout.fogColor, layout.fogNear, layout.fogFar]} />
          <PerspectiveCamera makeDefault position={[0, 4.8, 15]} fov={48} />

          <ambientLight intensity={0.58} />
          <directionalLight
            castShadow
            position={[9, 14, 8]}
            intensity={1.25}
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-24}
            shadow-camera-right={24}
            shadow-camera-top={24}
            shadow-camera-bottom={-24}
          />
          <pointLight position={[4.7, 4.2, -3.4]} intensity={0.85} color="#fff1a6" />

          <Suspense fallback={null}>
            <Environment preset="lobby" />
          </Suspense>

          <Suspense fallback={null}>
            <Scene
              mode={mode}
              isNearNpc={isNearNpc}
              conversationStatus={conversationStatus}
            />
            <PlayerController
              key={layout.id}
              mode={mode}
              layout={layout}
              onNearNpcChange={onNearNpcChange}
              onNearTransitChange={onNearTransitChange}
              onInteract={onInteract}
              onTransitInteract={onTransitInteract}
              conversationFocus={conversationFocus}
            />
          </Suspense>
        </Canvas>
      </KeyboardControls>
      <Loader />
    </div>
  );
}
