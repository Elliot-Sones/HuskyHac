import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { KeyboardControls, Loader, PerspectiveCamera, Environment } from "@react-three/drei";
import { AirportScene } from "./AirportScene";
import { TaxiScene } from "./TaxiScene";
import { Taxi } from "./Taxi";
import { Player } from "./Player";
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
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          gl={{ antialias: true, toneMappingExposure: 1.05 }}
          camera={{ position: [0, 6, 12], fov: 55 }}
          dpr={[1, 2]}
        >
          <color attach="background" args={["#dde3ec"]} />
          <fog attach="fog" args={["#dfe4ec", 22, 60]} />
          <PerspectiveCamera makeDefault fov={55} position={[0, 6, 12]} />
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[8, 14, 6]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />

          <Suspense fallback={null}>
            <Environment preset="lobby" />
          </Suspense>

          <Suspense fallback={null}>
            <SceneSwitch />
            <Player />
          </Suspense>
        </Canvas>
      </KeyboardControls>
      <Loader />
    </>
  );
}
