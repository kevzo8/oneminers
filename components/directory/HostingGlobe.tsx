"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Move } from "lucide-react";
import { HOSTING_SITES, type HostingSite } from "@/lib/hosting";
import { WORLD_DOTS } from "@/lib/worldDots";

const RAD = Math.PI / 180;
const CX = 280;
const CY = 190;
const R = 170;
const PARALLELS = [-60, -30, 0, 30, 60];
const MERIDIANS = Array.from({ length: 12 }, (_, index) => -180 + index * 30);

type Point = { x: number; y: number; z: number };
type Palette = {
  grid: string;
  sphereLight: string;
  sphereDark: string;
  accent: string;
  aqua: string;
  land: string;
  text: string;
  legend: string;
};

function palette(light: boolean): Palette {
  return light
    ? {
        grid: "rgba(17,24,39,0.16)",
        sphereLight: "#ffffff",
        sphereDark: "#e6edf3",
        accent: "#2e7d32",
        aqua: "#0e7490",
        land: "#55606b",
        text: "#111827",
        legend: "rgba(17,24,39,0.55)",
      }
    : {
        grid: "rgba(255,255,255,0.14)",
        sphereLight: "#16232e",
        sphereDark: "#080d12",
        accent: "#b9ff66",
        aqua: "#4de1ff",
        land: "#93a1ad",
        text: "#f4f7f5",
        legend: "rgba(244,247,245,0.7)",
      };
}

function project(lat: number, lon: number, rotation: number, tilt: number): Point {
  const phi = lat * RAD;
  const lambda = (lon + rotation) * RAD;
  const x = Math.cos(phi) * Math.sin(lambda);
  const baseY = Math.sin(phi);
  const baseZ = Math.cos(phi) * Math.cos(lambda);
  const tiltRad = tilt * RAD;
  const y = baseY * Math.cos(tiltRad) - baseZ * Math.sin(tiltRad);
  const z = baseY * Math.sin(tiltRad) + baseZ * Math.cos(tiltRad);
  return { x: CX + x * R, y: CY - y * R, z };
}

function linePath(coords: [number, number][], rotation: number, tilt: number) {
  let path = "";
  let drawing = false;
  for (const [lat, lon] of coords) {
    const point = project(lat, lon, rotation, tilt);
    if (point.z > 0) {
      path += `${drawing ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)} `;
      drawing = true;
    } else {
      drawing = false;
    }
  }
  return path;
}

const PARALLEL_PATHS: [number, number][][] = PARALLELS.map((lat) =>
  Array.from({ length: 73 }, (_, index) => [lat, -180 + index * 5] as [number, number])
);
const MERIDIAN_PATHS: [number, number][][] = MERIDIANS.map((lon) =>
  Array.from({ length: 37 }, (_, index) => [-90 + index * 5, lon] as [number, number])
);

export default function HostingGlobe() {
  const uid = useId().replace(/:/g, "");
  const rotationRef = useRef(24);
  const tiltRef = useRef(12);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const [rotation, setRotation] = useState(24);
  const [tilt, setTilt] = useState(12);
  const [pulse, setPulse] = useState(0);
  const [light, setLight] = useState(false);

  useEffect(() => {
    const updateTheme = () => setLight(document.documentElement.dataset.theme === "light");
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let lastTick = performance.now();
    let lastRender = 0;
    const tick = (now: number) => {
      if (now - lastRender > 32) {
        lastRender = now;
        if (!dragging.current && !reduced) {
          rotationRef.current = (rotationRef.current + (now - lastTick) * 0.006) % 360;
          setRotation(rotationRef.current);
          setPulse(now / 1000);
        }
        lastTick = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const p = palette(light);

  const markers = HOSTING_SITES.map((site: HostingSite, index: number) => ({
    site,
    index,
    point: project(site.lat, site.lon, rotation, tilt),
  })).filter((marker) => marker.point.z > 0.02);

  const landDots = WORLD_DOTS.map(([lon, lat]) => project(lat, lon, rotation, tilt)).filter((point) => point.z > 0);

  const arcs: { path: string; opacity: number }[] = [];
  for (let i = 0; i < markers.length; i += 1) {
    for (let j = i + 1; j < markers.length; j += 1) {
      const a = markers[i].point;
      const b = markers[j].point;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = mx - CX;
      const dy = my - CY;
      const length = Math.hypot(dx, dy) || 1;
      const lift = R * 0.16;
      arcs.push({
        path: `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${(mx + (dx / length) * lift).toFixed(1)},${(my + (dy / length) * lift).toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`,
        opacity: Math.min(a.z, b.z) * 0.22,
      });
    }
  }

  const labels: { id: string; x: number; y: number; text: string; color: string; opacity: number }[] = [];
  for (const marker of markers.slice().sort((a, b) => b.point.z - a.point.z)) {
    if (marker.point.z < 0.45) continue;
    const x = marker.point.x + 10;
    const y = marker.point.y - 8 + (marker.index % 2) * 16;
    if (labels.some((label) => Math.hypot(label.x - x, label.y - y) < 38)) continue;
    labels.push({
      id: marker.site.id,
      x,
      y,
      text: marker.site.globeCode,
      color: marker.index === 0 ? p.accent : p.aqua,
      opacity: Math.min(1, marker.point.z * 1.4),
    });
  }

  return (
    <div>
      <div
        className="relative select-none touch-none"
        onPointerDown={(event) => {
          dragging.current = true;
          lastX.current = event.clientX;
          lastY.current = event.clientY;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragging.current) return;
          rotationRef.current = (rotationRef.current + (event.clientX - lastX.current) * 0.45 + 360) % 360;
          tiltRef.current = Math.min(75, Math.max(-75, tiltRef.current - (event.clientY - lastY.current) * 0.35));
          lastX.current = event.clientX;
          lastY.current = event.clientY;
          setRotation(rotationRef.current);
          setTilt(tiltRef.current);
        }}
        onPointerUp={(event) => {
          dragging.current = false;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <svg viewBox="0 0 560 400" className="mx-auto w-full max-w-[620px]" role="img" aria-label="Rotating, draggable globe showing OneMiners hosting locations">
          <defs>
            <radialGradient id={`sphere-${uid}`} cx="34%" cy="28%">
              <stop offset="0%" stopColor={p.sphereLight} />
              <stop offset="100%" stopColor={p.sphereDark} />
            </radialGradient>
            <linearGradient id={`arc-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={p.accent} />
              <stop offset="100%" stopColor={p.aqua} />
            </linearGradient>
          </defs>

          <circle cx={CX} cy={CY} r={R} fill={`url(#sphere-${uid})`} stroke={p.grid} strokeWidth={1.4} />
          {[...PARALLEL_PATHS, ...MERIDIAN_PATHS].map((coords, index) => (
            <path
              key={index}
              d={linePath(coords, rotation, tilt)}
              fill="none"
              stroke={p.grid}
              strokeWidth={index < PARALLELS.length ? 0.9 : 0.7}
            />
          ))}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={p.aqua} strokeWidth={1.4} opacity={0.35} />

          {landDots.map((point, index) => (
            <circle
              key={`land-${index}`}
              cx={point.x}
              cy={point.y}
              r={0.7 + point.z * 0.8}
              fill={p.land}
              opacity={0.12 + point.z * 0.42}
            />
          ))}

          {arcs.map((arc, index) => (
            <path key={`arc-${index}`} d={arc.path} fill="none" stroke={`url(#arc-${uid})`} strokeWidth={1.2} opacity={arc.opacity} />
          ))}

          {markers
            .slice()
            .sort((a, b) => a.point.z - b.point.z)
            .map(({ site, index, point }) => {
              const glow = 1 + Math.sin(pulse * 2 + index) * 0.28;
              const color = index === 0 ? p.accent : p.aqua;
              return (
                <g key={site.id}>
                  <circle cx={point.x} cy={point.y} r={7 * glow} fill="none" stroke={color} strokeWidth={1} opacity={point.z * 0.45} />
                  <circle cx={point.x} cy={point.y} r={3.8} fill={color} opacity={0.45 + point.z * 0.55} />
                </g>
              );
            })}
          {labels.map((label) => (
            <g key={label.id}>
              <circle cx={label.x - 3} cy={label.y - 9} r={11} fill={p.sphereDark} opacity={label.opacity * 0.75} />
              <text x={label.x} y={label.y} fill={label.color} fontSize={10} fontWeight={800} opacity={label.opacity}>
                {label.text}
              </text>
            </g>
          ))}
        </svg>
        <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] text-muted">
          <Move className="h-3 w-3" /> Drag to spin and tilt the globe
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {HOSTING_SITES.map((site, index) => (
          <div key={site.id} className="flex items-center gap-1.5 rounded-lg border border-line bg-panel-soft px-2 py-1.5 text-[10px]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: index === 0 ? p.accent : p.aqua }} />
            <span className="truncate text-muted">{site.name}</span>
            <span className="ml-auto shrink-0 font-semibold tabular-nums text-ink">{(site.rate * 100).toFixed(1)}¢</span>
          </div>
        ))}
      </div>
    </div>
  );
}
