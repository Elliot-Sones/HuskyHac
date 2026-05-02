import { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { COUNTRIES_GEOJSON_URL, flagFromIsoA2, SUPPORTED, TEASERS } from './countries';
import { getCountryLearningProfile } from '@/scenarios/countryAirportScenario';

type Feature = {
  type: 'Feature';
  properties: { ADMIN: string; ISO_A2?: string; [k: string]: unknown };
  geometry: any;
};

const OCEAN = '#2275cc';
const LAND = '#5b9c79';
const LAND_DARK = '#2c5e44';
const LAND_SUPPORTED = '#86b89c';
const LAND_TEASER = '#6a9d80';
const LAND_HOVER = '#7fb594';
const LAND_SELECT = '#facc15';

export type GlobePin = { lat: number; lng: number; flag: string };

type Props = {
  selected: string | null;
  pin: GlobePin | null;
  onPickCountry: (name: string, feature: Feature) => void;
};

function buildLabel(d: Feature): string {
  const name = d.properties.ADMIN;
  const supported = SUPPORTED[name];
  const teaser = TEASERS[name];
  const profile = getCountryLearningProfile(name);
  const iso = (d.properties.ISO_A2 as string | undefined) ?? null;
  const flag = supported?.flag ?? teaser?.flag ?? flagFromIsoA2(iso);
  const sub = supported
    ? `Click to start your ${supported.language} trip`
    : teaser
      ? `${teaser.language} · click to start`
      : `${profile.language.name} · click to start`;
  return `<div style="background:rgba(8,13,28,.94);padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.08);font-family:Inter,sans-serif;color:#e7ecf5;letter-spacing:0;">
    <div style="font-weight:700;font-size:13px;display:flex;align-items:center;gap:8px;">${flag} ${name}</div>
    <div style="font-size:11px;opacity:.65;margin-top:2px;letter-spacing:0">${sub}</div>
  </div>`;
}

export function GlobeCanvas({ selected, pin, onPickCountry }: Props) {
  const globeRef = useRef<any>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{ selected: string | null; hovered: string | null }>({
    selected: null,
    hovered: null,
  });
  const hasFlownInRef = useRef(false);
  const onPickRef = useRef(onPickCountry);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  const oceanMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color(OCEAN) }),
    [],
  );

  // Force a new polygonsData reference whenever the selection or hover changes
  // so three-globe re-evaluates the accessor functions. Cheap (small array).
  // This avoids the manual `polygonAltitude(polygonAltitude())` refresh trick,
  // which crashes three-globe by re-entering its update digest.
  const polygonsForRender = useMemo(
    () => features.slice(),
    [features, selected, hovered],
  );

  // Mirror selected/hovered into a ref so accessor closures always read fresh
  // values, even before the next React render commits.
  useEffect(() => {
    stateRef.current.selected = selected;
  }, [selected]);
  useEffect(() => {
    stateRef.current.hovered = hovered;
  }, [hovered]);

  useEffect(() => {
    onPickRef.current = onPickCountry;
  });

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(COUNTRIES_GEOJSON_URL)
      .then((r) => r.json())
      .then((geo) => {
        if (cancelled) return;
        setFeatures(
          geo.features.filter((f: Feature) => f.properties.ADMIN !== 'Antarctica'),
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // One-time globe configuration: material, controls, intro pan.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const world = globeRef.current;
      if (!world) return;
      try {
        const mat = world.globeMaterial() as THREE.MeshPhongMaterial;
        mat.color.set(OCEAN);
        if ('emissive' in mat) {
          mat.emissive.set(OCEAN);
          mat.emissiveIntensity = 1;
        }
        if ('shininess' in mat) {
          mat.shininess = 0;
        }
        mat.needsUpdate = true;
      } catch {
        /* material not ready */
      }
      const controls = world.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.28;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.55;
      controls.minDistance = 180;
      controls.maxDistance = 600;
      controls.enablePan = false;
      world.pointOfView({ lat: 28, lng: 6, altitude: 2.35 }, 1400);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const stop = () => {
      const c = globeRef.current?.controls();
      if (c) c.autoRotate = false;
    };
    const evs: Array<keyof DocumentEventMap> = ['mousedown', 'touchstart', 'wheel'];
    evs.forEach((ev) => el.addEventListener(ev, stop, { passive: true }));
    return () => evs.forEach((ev) => el.removeEventListener(ev, stop));
  }, []);

  // Camera animation: gentle fly-in on first pick, fixed altitude re-aim on
  // later picks. We do NOT call `pointOfView()` as a getter (that path is what
  // triggered the `pov is undefined` crash inside three-globe).
  useEffect(() => {
    const world = globeRef.current;
    if (!world) return;
    const controls = world.controls();
    if (selected && pin) {
      controls.autoRotate = false;
      if (!hasFlownInRef.current) {
        world.pointOfView({ lat: pin.lat, lng: pin.lng, altitude: 1.85 }, 1100);
        hasFlownInRef.current = true;
      } else {
        world.pointOfView({ lat: pin.lat, lng: pin.lng, altitude: 1.85 }, 600);
      }
    } else {
      controls.autoRotate = true;
    }
  }, [selected, pin]);

  return (
    <div ref={hostRef} className="globe-host">
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterial={oceanMaterial}
        showGlobe
        showAtmosphere
        atmosphereColor="#a8c8ff"
        atmosphereAltitude={0.18}
        polygonsData={polygonsForRender}
        polygonsTransitionDuration={380}
        polygonAltitude={(d: any) => {
          const name = d.properties.ADMIN;
          if (stateRef.current.selected === name) return 0.055;
          if (stateRef.current.hovered === name) return 0.038;
          return 0.014;
        }}
        polygonCapColor={(d: any) => {
          const name = d.properties.ADMIN;
          if (stateRef.current.selected === name) return LAND_SELECT;
          if (stateRef.current.hovered === name) return LAND_HOVER;
          if (SUPPORTED[name]) return LAND_SUPPORTED;
          if (TEASERS[name]) return LAND_TEASER;
          return LAND;
        }}
        polygonSideColor={() => LAND_DARK}
        polygonStrokeColor={() => 'rgba(0,0,0,0.32)'}
        polygonLabel={buildLabel as any}
        onPolygonHover={(p: any) => {
          setHovered(p ? (p.properties.ADMIN as string) : null);
          document.body.style.cursor = p ? 'pointer' : 'default';
        }}
        onPolygonClick={(p: any) => {
          if (!p) return;
          onPickRef.current(p.properties.ADMIN as string, p);
        }}
        htmlElementsData={pin ? [pin] : []}
        htmlElement={
          ((d: any) => {
            const el = document.createElement('div');
            el.className = 'flag-pin';
            el.textContent = d.flag;
            return el;
          }) as any
        }
        htmlAltitude={0.07}
      />
    </div>
  );
}

export function featureCentroid(feature: Feature): [number, number] {
  const coords: number[][] = [];
  const collect = (arr: any) => {
    if (typeof arr[0] === 'number') coords.push(arr as number[]);
    else (arr as any[]).forEach(collect);
  };
  collect(feature.geometry.coordinates);
  const n = coords.length || 1;
  let lng = 0;
  let lat = 0;
  coords.forEach((c) => {
    lng += c[0];
    lat += c[1];
  });
  return [lng / n, lat / n];
}
