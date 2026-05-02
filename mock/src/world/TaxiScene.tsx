import { Text, ContactShadows } from "@react-three/drei";
import { Character } from "./Character";

/**
 * Taxi interior scene — the player is now INSIDE the taxi
 * (rear right passenger seat). The driver sits up-front-left,
 * a Paris street is visible through the windshield as a
 * parallax-style billboard backdrop.
 */
export function TaxiScene() {
  return (
    <>
      <hemisphereLight args={["#cce4ff", "#403020", 0.45]} />

      {/* === backdrop: street through the windshield === */}
      {/* Distant skyline silhouette */}
      <ParisSkyline />

      {/* === Taxi cabin (interior shell, viewed from inside-back) === */}
      {/* Floor of the cabin */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[2.4, 4.5]} />
        <meshStandardMaterial color="#1f2937" roughness={0.85} />
      </mesh>

      {/* Dashboard (in front of driver / passenger) */}
      <mesh castShadow position={[0, 0.95, 1.85]}>
        <boxGeometry args={[2.1, 0.45, 0.5]} />
        <meshStandardMaterial color="#1f2937" roughness={0.55} metalness={0.2} />
      </mesh>
      {/* Dashboard cluster lights */}
      <mesh position={[-0.4, 1.05, 1.6]}>
        <boxGeometry args={[0.4, 0.18, 0.05]} />
        <meshStandardMaterial color="#0c1a3a" emissive="#22d3ee" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.4, 1.05, 1.6]}>
        <boxGeometry args={[0.5, 0.18, 0.05]} />
        <meshStandardMaterial color="#0c1a3a" emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
      {/* Meter */}
      <group position={[0.6, 1.3, 1.7]}>
        <mesh castShadow>
          <boxGeometry args={[0.36, 0.22, 0.14]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0, 0, 0.075]}>
          <boxGeometry args={[0.3, 0.16, 0.01]} />
          <meshStandardMaterial color="#0c1a0c" emissive="#34d399" emissiveIntensity={0.7} />
        </mesh>
        <Text position={[0, 0, 0.085]} fontSize={0.07} color="#a7f3d0" anchorX="center" anchorY="middle">
          € 8,40
        </Text>
      </group>

      {/* Steering wheel */}
      <group position={[-0.55, 1.0, 1.45]} rotation={[Math.PI * 0.32, 0, 0]}>
        <mesh castShadow>
          <torusGeometry args={[0.22, 0.04, 12, 32]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>

      {/* Front seats (back of headrests visible from rear) */}
      <DriverSeat position={[-0.55, 0.55, 0.6]} />
      <PassengerSeat position={[0.55, 0.55, 0.6]} />

      {/* Player's seat (back row, where camera is) — visible only as cushion */}
      <RearSeat position={[0, 0.4, -0.9]} />

      {/* Windshield frame (top arch) */}
      <mesh position={[0, 1.85, 1.85]}>
        <boxGeometry args={[2.3, 0.18, 0.4]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[2.3, 0.12, 4.5]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* Pillars */}
      {(
        [
          [-1.15, 1.4, 1.85],
          [1.15, 1.4, 1.85],
          [-1.15, 1.4, -1.85],
          [1.15, 1.4, -1.85],
          [-1.15, 1.4, 0.0],
          [1.15, 1.4, 0.0],
        ] as [number, number, number][]
      ).map((p, i) => (
        <mesh key={i} castShadow position={p}>
          <boxGeometry args={[0.12, 1.5, 0.12]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      ))}

      {/* Side door panels (left/right interior walls) */}
      {[-1.18, 1.18].map((x) => (
        <mesh key={x} position={[x, 1.0, 0]}>
          <boxGeometry args={[0.06, 1.4, 4.4]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
      ))}

      {/* Rearview mirror */}
      <group position={[0, 1.85, 1.55]}>
        <mesh>
          <boxGeometry args={[0.4, 0.13, 0.06]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <boxGeometry args={[0.36, 0.1, 0.01]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>

      {/* Driver NPC */}
      <group position={[-0.55, 0.0, 0.6]} rotation={[0, 0, 0]}>
        <Character
          color="#dc2626"
          skin="#d4a574"
          hair="#1f2937"
          pants="#0f172a"
          accessory="scarf"
          walking={false}
          talking={true}
        />
      </group>

      {/* "Driver" name plate suspended above driver seat */}
      <Text position={[-0.55, 1.95, 0.6]} fontSize={0.08} color="#94a3b8" anchorX="center" anchorY="middle">
        Karim · Chauffeur
      </Text>

      {/* "Bienvenue à Paris" sticker on dashboard */}
      <group position={[0, 0.8, 1.55]}>
        <mesh>
          <boxGeometry args={[0.7, 0.12, 0.005]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        <Text position={[0, 0, 0.005]} fontSize={0.06} color="#0f172a" anchorX="center" anchorY="middle">
          BIENVENUE À PARIS
        </Text>
      </group>

      {/* Contact shadow under driver/seats */}
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.45}
        blur={2.6}
        scale={6}
        far={3}
        resolution={1024}
      />
    </>
  );
}

function DriverSeat({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.15, 0.7]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh castShadow position={[0, 0.55, -0.27]}>
        <boxGeometry args={[0.7, 1.1, 0.18]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* headrest */}
      <mesh castShadow position={[0, 1.18, -0.27]}>
        <boxGeometry args={[0.42, 0.28, 0.22]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}
function PassengerSeat({ position }: { position: [number, number, number] }) {
  return <DriverSeat position={position} />;
}
function RearSeat({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[2.0, 0.2, 0.8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh castShadow position={[0, 0.6, -0.32]}>
        <boxGeometry args={[2.0, 1.1, 0.2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

/**
 * Stylised Paris skyline visible through the windshield.
 * Two layers of buildings + an Eiffel Tower for unmistakable readability,
 * plus a sky gradient (via a big back-plane).
 */
function ParisSkyline() {
  return (
    <group position={[0, 0, 14]}>
      {/* Sky plane (very far back) */}
      <mesh position={[0, 6, 6]}>
        <planeGeometry args={[120, 30]} />
        <meshBasicMaterial color="#a3c4e8" />
      </mesh>
      {/* Sun glow */}
      <mesh position={[8, 7, 5.9]}>
        <circleGeometry args={[1.4, 32]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>

      {/* Far building strip */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = -22 + i * 3.4 + (i % 2 === 0 ? 0.3 : -0.5);
        const h = 2.5 + ((i * 1.3) % 3.5);
        return (
          <mesh key={"f" + i} position={[x, h / 2 + 0.5, 4]}>
            <boxGeometry args={[2.2, h, 0.6]} />
            <meshStandardMaterial color="#cdb89a" roughness={0.85} />
          </mesh>
        );
      })}

      {/* Mid building strip */}
      {Array.from({ length: 11 }).map((_, i) => {
        const x = -18 + i * 3.5 + (i % 3 === 0 ? 0.2 : -0.3);
        const h = 3.5 + ((i * 1.7) % 4);
        return (
          <group key={"m" + i} position={[x, h / 2 + 0.4, 2]}>
            <mesh>
              <boxGeometry args={[2.6, h, 0.7]} />
              <meshStandardMaterial color="#e8dcc4" roughness={0.85} />
            </mesh>
            {/* Roof (mansard) */}
            <mesh position={[0, h / 2 + 0.18, 0]}>
              <boxGeometry args={[2.7, 0.36, 0.75]} />
              <meshStandardMaterial color="#475569" roughness={0.55} metalness={0.4} />
            </mesh>
            {/* windows */}
            {Array.from({ length: 3 }).map((__, w) => (
              <mesh key={w} position={[-0.7 + w * 0.7, 0, 0.36]}>
                <boxGeometry args={[0.36, 0.5, 0.02]} />
                <meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.35} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Eiffel Tower (unmistakable Paris cue) */}
      <group position={[2, 0, 0]}>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[1.4, 0.3, 1.4]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.5} metalness={0.6} />
        </mesh>
        {/* lower tier */}
        <mesh castShadow position={[0, 1.7, 0]}>
          <coneGeometry args={[0.8, 2.4, 4]} />
          <meshStandardMaterial color="#a3a3a3" roughness={0.5} metalness={0.6} />
        </mesh>
        {/* mid tier */}
        <mesh castShadow position={[0, 3.5, 0]}>
          <boxGeometry args={[0.45, 0.6, 0.45]} />
          <meshStandardMaterial color="#a3a3a3" roughness={0.5} metalness={0.6} />
        </mesh>
        {/* top tier */}
        <mesh castShadow position={[0, 4.8, 0]}>
          <coneGeometry args={[0.25, 2.0, 4]} />
          <meshStandardMaterial color="#a3a3a3" roughness={0.5} metalness={0.6} />
        </mesh>
        {/* spire */}
        <mesh castShadow position={[0, 6.1, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.6, 8]} />
          <meshStandardMaterial color="#a3a3a3" />
        </mesh>
      </group>

      {/* Road below (asphalt) coming TOWARD the camera */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -7]}>
        <planeGeometry args={[40, 14]} />
        <meshStandardMaterial color="#3f4651" roughness={0.95} />
      </mesh>
      {/* Road dashed lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 0.012, -2 - i * 1.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.18, 1.0]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>
      ))}
    </group>
  );
}
