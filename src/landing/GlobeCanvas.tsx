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
  const featuresLoadedRef = useRef(false);
  const onPickRef = useRef(onPickCountry);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  const oceanMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color(OCEAN) }),
    [],
  );

  // Keep the latest onPickCountry reachable from inside the imperative click handler.
  useEffect(() => {
    onPickRef.current = onPickCountry;
  });

  // Track viewport so the globe canvas resizes responsively.
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // One-time imperative configuration of the globe. Mirrors the order from the
  // working mockup so three-globe sees a consistent setup sequence.
  useEffect(() => {
    let cancelled = false;
    let cleanupListeners: (() => void) | null = null;

    const setupId = window.setTimeout(() => {
      const world = globeRef.current;
      const host = hostRef.current;
      if (!world || !host) return;

      try {
        const mat = world.globeMaterial() as THREE.MeshPhongMaterial;
        mat.color.set(OCEAN);
        mat.emissive.set(OCEAN);
        mat.emissiveIntensity = 1;
        mat.shininess = 0;
        mat.needsUpdate = true;
      } catch {
        // material may not be ready yet
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

      const stopAuto = () => {
        controls.autoRotate = false;
      };
      const evs: Array<keyof DocumentEventMap> = ['mousedown', 'touchstart', 'wheel'];
      evs.forEach((ev) => host.addEventListener(ev, stopAuto, { passive: true }));
      cleanupListeners = () => evs.forEach((ev) => host.removeEventListener(ev, stopAuto));

      world.pointOfView({ lat: 28, lng: 6, altitude: 2.35 }, 1400);

      // Set the html-element renderer once so subsequent htmlElementsData
      // updates re-use the same renderer.
      world
        .htmlElement((d: any) => {
          const el = document.createElement('div');
          el.className = 'flag-pin';
          el.textContent = d.flag;
          return el;
        })
        .htmlAltitude(0.07);

      // Load countries and wire up polygon visuals + interactions imperatively.
      fetch(COUNTRIES_GEOJSON_URL)
        .then((r) => r.json())
        .then((geo) => {
          if (cancelled) return;
          const features = geo.features.filter(
            (f: Feature) => f.properties.ADMIN !== 'Antarctica',
          );

          world
            .polygonsData(features)
            .polygonsTransitionDuration(380)
            .polygonSideColor(() => LAND_DARK)
            .polygonStrokeColor(() => 'rgba(0,0,0,0.32)')
            .polygonAltitude((d: any) => {
              const name = d.properties.ADMIN;
              if (stateRef.current.selected === name) return 0.055;
              if (stateRef.current.hovered === name) return 0.038;
              return 0.014;
            })
            .polygonCapColor((d: any) => {
              const name = d.properties.ADMIN;
              if (stateRef.current.selected === name) return LAND_SELECT;
              if (stateRef.current.hovered === name) return LAND_HOVER;
              if (SUPPORTED[name]) return LAND_SUPPORTED;
              if (TEASERS[name]) return LAND_TEASER;
              return LAND;
            })
            .polygonLabel((d: any) => buildLabel(d))
            .onPolygonHover((p: any) => {
              stateRef.current.hovered = p ? p.properties.ADMIN : null;
              document.body.style.cursor = p ? 'pointer' : 'default';
              world.polygonAltitude(world.polygonAltitude());
              world.polygonCapColor(world.polygonCapColor());
            })
            .onPolygonClick((p: any) => {
              if (!p) return;
              onPickRef.current(p.properties.ADMIN as string, p);
            });

          featuresLoadedRef.current = true;
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(setupId);
      if (cleanupListeners) cleanupListeners();
    };
  }, []);

  // Sync `selected` -> internal state, refresh polygon visuals, animate camera.
  useEffect(() => {
    const world = globeRef.current;
    if (!world || !featuresLoadedRef.current) return;

    stateRef.current.selected = selected;
    world.polygonAltitude(world.polygonAltitude());
    world.polygonCapColor(world.polygonCapColor());

    const controls = world.controls();
    if (selected && pin) {
      controls.autoRotate = false;
      if (!hasFlownInRef.current) {
        world.pointOfView({ lat: pin.lat, lng: pin.lng, altitude: 1.85 }, 1100);
        hasFlownInRef.current = true;
      } else {
        const current = world.pointOfView();
        world.pointOfView(
          { lat: pin.lat, lng: pin.lng, altitude: current.altitude },
          600,
        );
      }
    } else {
      controls.autoRotate = true;
    }
  }, [selected, pin]);

  // Sync `pin` -> the single html element on the globe.
  useEffect(() => {
    const world = globeRef.current;
    if (!world || !featuresLoadedRef.current) return;
    world.htmlElementsData(pin ? [pin] : []);
  }, [pin]);

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
