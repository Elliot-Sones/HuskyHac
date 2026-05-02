import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { KeyboardControls, Loader, PerspectiveCamera } from "@react-three/drei";
import { AirportScene } from "./AirportScene";
import { Player } from "./Player";
import { NPC } from "./NPC";

const keyMap = [
  { name: "forward", keys: ["ArrowUp", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "d", "D"] },
  { name: "run", keys: ["Shift"] },
];

export function WorldCanvas() {
  return (
    <>
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          gl={{ antialias: true, toneMappingExposure: 1.05 }}
          camera={{ position: [0, 5, 8], fov: 55 }}
          dpr={[1, 2]}
        >
          <PerspectiveCamera makeDefault fov={55} position={[0, 5, 8]} />
          <Suspense fallback={null}>
            <AirportScene />
            <Player />
            <NPC />
          </Suspense>
          <fog attach="fog" args={["#dfe4ec", 22, 60]} />
        </Canvas>
      </KeyboardControls>
      <Loader />
    </>
  );
}
