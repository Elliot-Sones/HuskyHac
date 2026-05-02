import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { KeyboardControls, Loader, PerspectiveCamera, Environment } from "@react-three/drei";
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
          camera={{ position: [0, 6, 12], fov: 55 }}
          dpr={[1, 2]}
        >
          {/* IMMEDIATE BACKGROUND — outside Suspense so we never get a black canvas */}
          <color attach="background" args={["#dde3ec"]} />
          <fog attach="fog" args={["#dfe4ec", 22, 60]} />
          <PerspectiveCamera makeDefault fov={55} position={[0, 6, 12]} />
          {/* basic lighting outside Suspense, in case Environment fails */}
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

          {/* Environment is a separate Suspense boundary so failure here doesn't kill the scene */}
          <Suspense fallback={null}>
            <Environment preset="lobby" />
          </Suspense>

          {/* Scene + characters */}
          <Suspense fallback={null}>
            <AirportScene />
            <Player />
            <NPC />
          </Suspense>
        </Canvas>
      </KeyboardControls>
      <Loader />
    </>
  );
}
