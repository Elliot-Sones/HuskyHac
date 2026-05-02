import { useRef } from "react";
import { Text, ContactShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Procedural airport-ish environment.
 * Floor + a long info-desk counter + a glowing departure board +
 * a few standing pillars and overhead signage.
 *
 * It's meant to read as "airport at a glance" without needing real
 * airport GLBs — the same approach the production scene will use
 * before we drop in higher-fidelity assets.
 */
export function AirportScene() {
  return (
    <>
      {/* ===== ambient hemisphere fill ===== */}
      <hemisphereLight args={["#cce4ff", "#403020", 0.45]} />

      {/* ===== floor ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#cfd2d6" roughness={0.85} metalness={0.05} />
      </mesh>
      {/* floor accent stripes - airport wayfinding */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 4]}>
        <planeGeometry args={[1.4, 30]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 4]}>
        <planeGeometry args={[0.25, 30]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>

      {/* contact shadows for grounded characters */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.55}
        blur={2.4}
        scale={30}
        far={6}
        resolution={1024}
      />

      {/* ===== info-desk counter ===== */}
      <group position={[5, 0, -3]}>
        {/* counter body */}
        <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
          <boxGeometry args={[5, 1.1, 1.3]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* counter top */}
        <mesh castShadow position={[0, 1.13, 0]}>
          <boxGeometry args={[5.1, 0.06, 1.4]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* "INFORMATION" sign hanging above */}
        <mesh castShadow position={[0, 3.2, 0]}>
          <boxGeometry args={[3.2, 0.7, 0.12]} />
          <meshStandardMaterial color="#0f172a" emissive="#1e40af" emissiveIntensity={0.35} />
        </mesh>
        <Text
          position={[0, 3.2, 0.07]}
          fontSize={0.32}
          color="#fde68a"
          anchorX="center"
          anchorY="middle"
        >
          INFORMATION
        </Text>
        <Text
          position={[0, 2.85, 0.07]}
          fontSize={0.18}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
        >
          Renseignements
        </Text>
        {/* hanging supports */}
        <mesh position={[-1.4, 4.0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.6, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[1.4, 4.0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.6, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      </group>

      {/* ===== departure board ===== */}
      <group position={[-7, 0, -5]}>
        {/* back wall */}
        <mesh castShadow position={[0, 2.5, 0]}>
          <boxGeometry args={[6, 4, 0.2]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
        {/* glowing screen */}
        <mesh position={[0, 2.5, 0.11]}>
          <boxGeometry args={[5.6, 3.6, 0.05]} />
          <meshStandardMaterial
            color="#0c1a3a"
            emissive="#1e40af"
            emissiveIntensity={0.6}
          />
        </mesh>
        <Text
          position={[0, 4.0, 0.16]}
          fontSize={0.34}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
        >
          ARRIVÉES · ARRIVALS
        </Text>
        {/* fake flight rows */}
        {[
          { f: "AF22", o: "New York", t: "09:15", s: "Atterri" },
          { f: "AF18", o: "Tokyo", t: "09:42", s: "Atterri" },
          { f: "JL45", o: "Osaka", t: "10:08", s: "À l'heure" },
          { f: "BA341", o: "London", t: "10:22", s: "À l'heure" },
        ].map((r, i) => {
          const y = 3.3 - i * 0.55;
          return (
            <group key={r.f} position={[0, y, 0.16]}>
              <Text position={[-2.4, 0, 0]} fontSize={0.22} color="#fde68a" anchorX="left">
                {r.f}
              </Text>
              <Text position={[-1.3, 0, 0]} fontSize={0.22} color="#fde68a" anchorX="left">
                {r.o}
              </Text>
              <Text position={[1.0, 0, 0]} fontSize={0.22} color="#fde68a" anchorX="left">
                {r.t}
              </Text>
              <Text
                position={[2.0, 0, 0]}
                fontSize={0.2}
                color={r.s === "Atterri" ? "#34d399" : "#fbbf24"}
                anchorX="left"
              >
                {r.s}
              </Text>
            </group>
          );
        })}
      </group>

      {/* ===== columns for spatial depth ===== */}
      {[-12, -4, 4, 12].map((x) => (
        <group key={x} position={[x, 0, -10]}>
          <mesh castShadow position={[0, 3, 0]}>
            <boxGeometry args={[0.7, 6, 0.7]} />
            <meshStandardMaterial color="#e8e3da" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* baggage cart suggestion (small detail prop) */}
      <group position={[-4, 0, 3]} rotation={[0, 0.4, 0]}>
        <mesh castShadow position={[0, 0.6, 0]}>
          <boxGeometry args={[1.4, 0.5, 0.7]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 1.0, 0]}>
          <boxGeometry args={[1.2, 0.3, 0.6]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
      </group>

      {/* hanging directional sign over the path */}
      <group position={[0, 4.5, 8]}>
        <mesh castShadow>
          <boxGeometry args={[3.5, 0.7, 0.12]} />
          <meshStandardMaterial color="#1e3a8a" emissive="#1e3a8a" emissiveIntensity={0.25} />
        </mesh>
        <Text position={[0, 0, 0.07]} fontSize={0.28} color="#fff" anchorX="center" anchorY="middle">
          ← Sortie / Exit ·  Trains →
        </Text>
      </group>
    </>
  );
}

// Make TS happy with non-typed positions
export type V3 = [number, number, number];
// silence lint
void useRef; void useFrame; void THREE;
