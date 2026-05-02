import { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { COUNTRIES_GEOJSON_URL, SUPPORTED, TEASERS } from './countries';

type Feature = {
  type: 'Feature';
  properties: { ADMIN: string; ISO_A2?: string; [k: string]: unknown };
  geometry: any;
};

// Abstract blue marble — one hue family. Land is barely-there until hovered.
const OCEAN = '#2188cc';
const OCEAN_GLOW = '#1c79b8';
const LAND = '#1c79b8';        // a notch darker than ocean (subtle relief)
const LAND_DARK = '#155b91';   // extrusion side
const LAND_HOVER = '#7fc4ee';  // light, clear highlight on hover
const LAND_SUPPORTED = '#3398d6';
const LAND_TEASER = '#2e8fcd';
const LAND_SELECT = '#f5b647'; // warm gold — the only non-blue accent

export type GlobePin = { lat: number; lng: number; flag: string };

type Props = {
  selected: string | null;
  pin: GlobePin | null;
  onPickCountry: (name: string, feature: Feature) => void;
  onUnknownCountry: (name: string) => void;
};

export function GlobeCanvas({ selected, pin, onPickCountry, onUnknownCountry }: Props) {
  const globeRef = useRef<any>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    let cancelled = false;
    fetch(COUNTRIES_GEOJSON_URL)
      .then((r) => r.json())
      .then((geo) => {
        if (cancelled) return;
        setFeatures(geo.features.filter((f: Feature) => f.properties.ADMIN !== 'Antarctica'));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const g = globeRef.current;
      if (!g) return;
      try {
        const mat = g.globeMaterial() as THREE.MeshPhongMaterial;
        mat.color = new THREE.Color(OCEAN);
        mat.emissive = new THREE.Color(OCEAN_GLOW);
        mat.emissiveIntensity = 0.06;
        mat.shininess = 8;
      } catch {
        /* material may not be ready yet */
      }
      const controls = g.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.28;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.55;
      controls.minDistance = 180;
      controls.maxDistance = 600;
      controls.enablePan = false;
      g.pointOfView({ lat: 28, lng: 6, altitude: 2.35 }, 1400);
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

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    if (selected && pin) {
      controls.autoRotate = false;
      g.pointOfView({ lat: pin.lat, lng: pin.lng, altitude: 1.65 }, 1100);
    } else {
      controls.autoRotate = true;
    }
  }, [selected, pin]);

  const labelHtml = useMemo(
    () => (d: Feature) => {
      const name = d.properties.ADMIN;
      const supported = SUPPORTED[name];
      const teaser = TEASERS[name];
      if (supported) {
        return `<div style="background:rgba(255,255,255,0.96);padding:8px 12px;border-radius:10px;border:1px solid rgba(15,23,42,0.08);box-shadow:0 8px 24px -8px rgba(15,23,42,0.18);font-family:Inter,sans-serif;color:#0b1228;letter-spacing:-.005em;">
          <div style="font-weight:700;font-size:13px;display:flex;align-items:center;gap:8px;">${supported.flag} ${name}</div>
          <div style="font-size:11px;color:#64748b;margin-top:2px;letter-spacing:.02em">Click to start your ${supported.language} trip</div>
        </div>`;
      }
      if (teaser) {
        return `<div style="background:rgba(255,255,255,0.96);padding:8px 12px;border-radius:10px;border:1px solid rgba(15,23,42,0.08);box-shadow:0 8px 24px -8px rgba(15,23,42,0.18);font-family:Inter,sans-serif;color:#0b1228;letter-spacing:-.005em;">
          <div style="font-weight:700;font-size:13px;display:flex;align-items:center;gap:8px;">${teaser.flag} ${name}</div>
          <div style="font-size:11px;color:#64748b;margin-top:2px">${teaser.language} · in production</div>
        </div>`;
      }
      return `<div style="background:rgba(255,255,255,0.96);padding:6px 10px;border-radius:9px;border:1px solid rgba(15,23,42,0.08);font-family:Inter,sans-serif;color:#0b1228;font-size:12px;">${name}</div>`;
    },
    [],
  );

  return (
    <div ref={hostRef} className="globe-host">
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        showGlobe
        showAtmosphere
        atmosphereColor="#bcd9f5"
        atmosphereAltitude={0.13}
        polygonsData={features}
        polygonAltitude={(d: any) => {
          const name = d.properties.ADMIN;
          if (selected === name) return 0.045;
          if (hovered === name) return 0.025;
          return 0.005;
        }}
        polygonCapColor={(d: any) => {
          const name = d.properties.ADMIN;
          if (selected === name) return LAND_SELECT;
          if (hovered === name) return LAND_HOVER;
          if (SUPPORTED[name]) return LAND_SUPPORTED;
          if (TEASERS[name]) return LAND_TEASER;
          return LAND;
        }}
        polygonSideColor={() => LAND_DARK}
        polygonStrokeColor={() => 'rgba(255,255,255,0.10)'}
        polygonsTransitionDuration={380}
        polygonLabel={labelHtml as any}
        onPolygonHover={(p: any) => {
          setHovered(p ? p.properties.ADMIN : null);
          document.body.style.cursor = p ? 'pointer' : 'default';
        }}
        onPolygonClick={(p: any) => {
          if (!p) return;
          const name = p.properties.ADMIN as string;
          if (SUPPORTED[name] || TEASERS[name]) onPickCountry(name, p);
          else onUnknownCountry(name);
        }}
        htmlElementsData={pin ? [pin] : []}
        htmlElement={((d: any) => {
          const el = document.createElement('div');
          el.className = 'flag-pin';
          el.textContent = d.flag;
          return el;
        }) as any}
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
