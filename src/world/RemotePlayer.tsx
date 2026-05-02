import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { PlayerProfile } from '@/shared/contracts';
import { RemoteSnapshotStore } from '@/multiplayer/remoteSnapshotStore';
import { Character } from '@/world/Character';

interface RemotePlayerProps {
  profile: PlayerProfile;
  snapshots: RemoteSnapshotStore;
}

export function RemotePlayer({ profile, snapshots }: RemotePlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const visualRef = useRef<THREE.Group>(null);
  const walkingRef = useRef(false);
  const strideRef = useRef(1);
  const targetPosition = useMemo(() => new THREE.Vector3(0, 0, 8.6), []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const snapshot = snapshots.getSnapshot(profile.id);
    if (!group || !snapshot) return;

    targetPosition.set(snapshot.position.x, snapshot.position.y, snapshot.position.z);
    group.position.lerp(targetPosition, Math.min(1, delta * 10));
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, snapshot.rotationY, Math.min(1, delta * 12));
    walkingRef.current = snapshot.walking;
    strideRef.current = snapshot.running ? 1.45 : 1;

    if (visualRef.current) {
      visualRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * (snapshot.walking ? 0.02 : 0);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 8.6]} rotation={[0, Math.PI, 0]} name={`remote-${profile.id}`}>
      <group ref={visualRef}>
        <Character
          color={profile.color}
          pants="#1f2937"
          hair="#111827"
          accessory={profile.accessory}
          walkingRef={walkingRef}
          strideRef={strideRef}
        />
      </group>
      <Html position={[0, 2.15, 0]} center distanceFactor={9} occlude={false} wrapperClass="pointer-events-none">
        <div className="airport-nameplate">{profile.displayName}</div>
      </Html>
    </group>
  );
}

export function RemotePlayers({
  profiles,
  selfId,
  snapshots,
}: {
  profiles: PlayerProfile[];
  selfId?: string;
  snapshots: RemoteSnapshotStore;
}) {
  return (
    <>
      {profiles
        .filter((profile) => profile.id !== selfId && profile.connected)
        .map((profile) => (
          <RemotePlayer key={profile.id} profile={profile} snapshots={snapshots} />
        ))}
    </>
  );
}
