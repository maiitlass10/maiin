"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export type ScenePiece = { id: string; image: string; tag: string };

type Props = {
  pieces: ScenePiece[];
  selected: number;
  onSelect: (i: number) => void;
  rtl: boolean;
  reduced: boolean;
  active: boolean;
};

const GAP = 0.6; // distance between hooks along the rail
const RAIL_Y = 2.3; // rail height
const HOOK = 0.13; // hook wire length under the rail
const MAX_H = 1.5;
const MAX_W = 1.05;
const FAN = 1.55; // garments on the rail hang sideways, like a real rack (radians)
const PULL = 1.15; // how far the chosen garment comes towards the viewer

/** Exponential smoothing that behaves the same at any frame rate. */
const damp = (from: number, to: number, speed: number, dt: number) => THREE.MathUtils.damp(from, to, speed, dt);

/** A plane bent like fabric over shoulders: centre forward, sides back. */
function fabricGeometry(w: number, h: number) {
  const g = new THREE.PlaneGeometry(w, h, 24, 6);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (w / 2);
    const y = (p.getY(i) + h / 2) / h; // 0 bottom, 1 top
    p.setZ(i, -0.16 * w * x * x * (0.55 + 0.45 * y));
  }
  p.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

/** Small white price tag drawn on a canvas. */
function useTagTexture(text: string) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 160;
    c.height = 220;
    const x = c.getContext("2d")!;
    x.fillStyle = "#ffffff";
    x.beginPath();
    x.moveTo(30, 0);
    x.lineTo(130, 0);
    x.lineTo(160, 40);
    x.lineTo(160, 220);
    x.lineTo(0, 220);
    x.lineTo(0, 40);
    x.closePath();
    x.fill();
    x.fillStyle = "#d8d0c6";
    x.beginPath();
    x.arc(80, 36, 11, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = "#1c1a17";
    x.font = "600 46px Inter, system-ui, sans-serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(text, 80, 130);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [text]);
}

const metal = new THREE.MeshStandardMaterial({ color: "#8f8a84", metalness: 0.85, roughness: 0.28 });
const wire = new THREE.MeshStandardMaterial({ color: "#b9b4ad", metalness: 0.9, roughness: 0.25 });

function Garment({ piece, index, count, selected, hovered, setHovered, onSelect, side, reduced }: {
  piece: ScenePiece;
  index: number;
  count: number;
  selected: number;
  hovered: number | null;
  setHovered: (i: number | null) => void;
  onSelect: (i: number) => void;
  side: number;
  reduced: boolean;
}) {
  const tex = useTexture(piece.image);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const img = tex.image as { width: number; height: number };
  const aspect = img.width / img.height;
  let h = MAX_H;
  let w = h * aspect;
  if (w > MAX_W) {
    w = MAX_W;
    h = w / aspect;
  }
  const geo = useMemo(() => fabricGeometry(w, h), [w, h]);
  const tag = useTagTexture(piece.tag);
  const group = useRef<THREE.Group>(null);
  const swing = useRef({ angle: 0, vel: 0, last: selected });
  const baseX = (index - (count - 1) / 2) * GAP;

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(dt, 1 / 30);
    const isSel = index === selected;
    const isHover = hovered === index && !isSel;
    // Make room either side of the chosen piece.
    const gapShift = isSel ? 0 : index < selected ? -0.38 : 0.38;
    const tx = baseX + gapShift;
    const tz = isSel ? PULL : isHover ? 0.12 : 0;
    // On the rail garments turn sideways; the chosen one turns to face the camera.
    const ty = side * (isSel ? 0.62 : isHover ? FAN - 0.35 : FAN);
    const speed = reduced ? 40 : 6;
    g.position.x = damp(g.position.x, tx, speed, d);
    g.position.z = damp(g.position.z, tz, speed, d);
    g.rotation.y = damp(g.rotation.y, ty, speed, d);

    // A kick when this piece is picked or put back, then a damped pendulum swing.
    const s = swing.current;
    if (s.last !== selected) {
      if (index === selected || index === s.last) s.vel += (index === selected ? 1.6 : -1.1) * side;
      else if (Math.abs(index - selected) === 1) s.vel += 0.35 * Math.sign(index - selected);
      s.last = selected;
    }
    if (reduced) {
      s.angle = 0;
      s.vel = 0;
    } else {
      s.vel += (-28 * s.angle - 3.2 * s.vel) * d;
      s.angle += s.vel * d;
    }
    const idle = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.9 + index * 1.7) * 0.012;
    g.rotation.z = s.angle * 0.12 + idle;
    g.rotation.x = s.angle * 0.05;
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(index);
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6) return; // it was a drag
    onSelect(index);
  };

  return (
    <group ref={group} position={[baseX, RAIL_Y, 0]} rotation={[0, side * FAN, 0]}>
      {/* hook over the rail and the wire down to the garment */}
      <mesh material={wire} rotation={[0, Math.PI / 2, 0]} position={[0, 0.005, 0]}>
        <torusGeometry args={[0.045, 0.006, 8, 20, Math.PI * 1.25]} />
      </mesh>
      <mesh material={wire} position={[0, -HOOK / 2, 0]}>
        <cylinderGeometry args={[0.006, 0.006, HOOK, 6]} />
      </mesh>
      <mesh geometry={geo} position={[0, -HOOK - h / 2 + 0.04, 0]} onPointerOver={over} onPointerOut={() => setHovered(null)} onClick={click} castShadow>
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.42} roughness={0.95} metalness={0} alphaTest={0.45} side={THREE.DoubleSide} />
      </mesh>
      {/* price tag on a thread */}
      <group position={[w * 0.32, -HOOK - 0.1, 0.03]} rotation={[0, 0, -0.12]}>
        <mesh position={[0, 0.05, 0]} material={wire}>
          <cylinderGeometry args={[0.002, 0.002, 0.1, 4]} />
        </mesh>
        <mesh position={[0, -0.08, 0]}>
          <planeGeometry args={[0.13, 0.18]} />
          <meshBasicMaterial map={tag} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Rack({ count }: { count: number }) {
  const len = (count - 1) * GAP + 1.6;
  const half = len / 2;
  return (
    <group>
      <mesh material={metal} position={[0, RAIL_Y + 0.04, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, len, 24]} />
      </mesh>
      {[-half, half].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh material={metal} position={[0, (RAIL_Y + 0.04) / 2, 0]}>
            <cylinderGeometry args={[0.026, 0.026, RAIL_Y + 0.04, 16]} />
          </mesh>
          <mesh material={metal} position={[0, RAIL_Y + 0.04, 0]}>
            <sphereGeometry args={[0.04, 16, 12]} />
          </mesh>
          {/* foot */}
          <mesh material={metal} position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.9, 12]} />
          </mesh>
          {[-0.45, 0.45].map((z) => (
            <mesh key={z} position={[0, 0.02, z]}>
              <sphereGeometry args={[0.03, 12, 10]} />
              <meshStandardMaterial color="#2a2724" roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Soft, static shadow on the floor under the rack (cheap on phones). */
function FloorShadow({ width }: { width: number }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(70,55,42,0.3)");
    g.addColorStop(0.55, "rgba(70,55,42,0.12)");
    g.addColorStop(1, "rgba(70,55,42,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0.35]}>
      <planeGeometry args={[width, 2.2]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** Camera dollies along the rack to the chosen piece and leans with the pointer. */
function CameraRig({ selected, count, side, reduced }: { selected: number; count: number; side: number; reduced: boolean }) {
  const { camera, size, pointer } = useThree();
  const look = useRef(new THREE.Vector3());
  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 30);
    const narrow = size.width / size.height < 1;
    const x = (selected - (count - 1) / 2) * GAP;
    const off = narrow ? { x: 2 * side, y: 0.35, z: 5.6 } : { x: 3.1 * side, y: 0.45, z: 4.1 };
    const lean = reduced ? 0 : 1;
    const speed = reduced ? 40 : 3;
    camera.position.x = damp(camera.position.x, x + off.x + pointer.x * 0.35 * lean, speed, d);
    camera.position.y = damp(camera.position.y, 1.5 + off.y + pointer.y * 0.2 * lean, speed, d);
    camera.position.z = damp(camera.position.z, off.z, speed, d);
    look.current.x = damp(look.current.x, x, speed, d);
    look.current.y = 1.42;
    look.current.z = PULL * 0.75;
    camera.lookAt(look.current);
  });
  return null;
}

function Scene({ pieces, selected, onSelect, rtl, reduced }: Omit<Props, "active">) {
  const [hovered, setHovered] = useState<number | null>(null);
  const side = rtl ? -1 : 1;
  const { gl } = useThree();
  useEffect(() => {
    gl.domElement.style.cursor = hovered !== null && hovered !== selected ? "pointer" : "";
  }, [hovered, selected, gl]);
  return (
    <>
      <hemisphereLight args={["#ffffff", "#e9dccd", 1.1]} />
      <directionalLight position={[3 * side, 6, 5]} intensity={1.6} />
      <directionalLight position={[-4 * side, 3, -2]} intensity={0.5} color="#ffe9d6" />
      <CameraRig selected={selected} count={pieces.length} side={side} reduced={reduced} />
      <Rack count={pieces.length} />
      <Suspense fallback={null}>
        {pieces.map((p, i) => (
          <Garment key={p.id} piece={p} index={i} count={pieces.length} selected={selected} hovered={hovered} setHovered={setHovered} onSelect={onSelect} side={side} reduced={reduced} />
        ))}
      </Suspense>
      <FloorShadow width={(pieces.length - 1) * GAP + 2.4} />
    </>
  );
}

export default function RackScene({ active, ...props }: Props) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ fov: 32, position: [props.rtl ? -3.5 : 3.5, 2, 3.9], near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
