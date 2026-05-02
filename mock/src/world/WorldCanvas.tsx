import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { KeyboardControls, Loader, PerspectiveCamera, Environment } from "@react-three/drei";
import { AirportScene } from "./AirportScene";
import { TaxiScene } from "./TaxiScene";
import { Taxi } from "./Taxi";
import { PlayerController } from "./PlayerController";
import { NPC } from "./NPC";
import { useGameStore } from "../store/gameStore";

const keyMap = [
  { name: "forward", keys: ["ArrowUp", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "d", "D"] },
  { name: "run", keys: ["Shift"] },
];

function SceneSwitch() {
  const scene = useGameStore((s) => s.scene);
  if (scene === "taxi") return <TaxiScene />;
  return (
    <>
      <AirportScene />
      <Taxi />
      <NPC />
    </>
  );
}

export function WorldCanvas() {
  return (
    <>
      <div data-testid="world-canvas-host" className="h-full w-full">
        <KeyboardControls map={keyMap}>
          <Canvas
            data-testid="world-canvas"
            shadows
            gl={{ antialias: true, toneMappingExposure: 1.08 }}
            camera={{ position: [0, 6, 12], fov: 55 }}
            dpr={[1, 2]}
          >
            <color attach="background" args={["#dfe7ef"]} />
            <fog attach="fog" args={["#dfe7ef", 24, 68]} />
            <PerspectiveCamera makeDefault fov={55} position={[0, 6, 12]} />
            <ambientLight intensity={0.68} />
            <directionalLight
              position={[8, 14, 6]}
              intensity={1.18}
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-22}
              shadow-camera-right={22}
              shadow-camera-top={22}
              shadow-camera-bottom={-22}
            />

            <Suspense fallback={null}>
              <Environment preset="lobby" />
            </Suspense>

            <Suspense fallback={null}>
              <SceneSwitch />
              <PlayerController />
            </Suspense>
          </Canvas>
        </KeyboardControls>
      </div>
      <Loader />
    </>
  );
}
