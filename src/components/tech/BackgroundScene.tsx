import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ShaderMaterial } from "three";
import { useTheme } from "@/theme/theme-context";

const LINES = 44;
const POINTS = 180;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  varying float vAlpha;

  void main() {
    float x = position.x * 9.0;
    float row = position.y;
    float t = uTime * 0.12;

    // Two crossing waves give the contour-line terrain; scroll raises the relief.
    float relief = 0.55 + uScroll * 0.9;
    float h = sin(x * 0.55 + row * 6.0 + t) * 0.6 + sin(x * 1.25 - row * 4.0 + t * 1.4) * 0.3;
    h *= relief;

    // The pointer pushes nearby lines upwards.
    vec2 p = vec2(x, row * 8.0 - 4.0);
    h += exp(-dot(p - uPointer * vec2(9.0, 4.0), p - uPointer * vec2(9.0, 4.0)) * 0.12) * 0.8;

    vec3 pos = vec3(x, h - 1.2, row * -9.0 + 3.0);
    vAlpha = smoothstep(0.0, 0.25, row) * (1.0 - smoothstep(0.7, 1.0, row)) * (1.0 - smoothstep(0.55, 1.0, abs(position.x)));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(uColor, vAlpha * uOpacity);
  }
`;

// Each line is a strip of POINTS vertices; `position.x` runs along the line
// (-1..1) and `position.y` is the line's depth (0..1). The vertex shader lifts
// them into 3D, so the geometry never changes after creation.
function createGeometry(): BufferGeometry {
  const positions = new Float32Array(LINES * (POINTS - 1) * 2 * 3);
  let offset = 0;
  for (let line = 0; line < LINES; line++) {
    const row = line / (LINES - 1);
    for (let point = 0; point < POINTS - 1; point++) {
      for (const step of [point, point + 1]) {
        positions[offset++] = (step / (POINTS - 1)) * 2 - 1;
        positions[offset++] = row;
        positions[offset++] = 0;
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  return geometry;
}

function ContourLines() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const material = useRef<ShaderMaterial>(null);
  const [geometry] = useState(createGeometry);
  const [uniforms] = useState(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uPointer: { value: { x: 0, y: 0 } },
    uColor: { value: new Color() },
    uOpacity: { value: 0.5 },
  }));
  const pointer = useRef({ x: 0, y: 0 });

  useFrame(({ pointer: ndc }, delta) => {
    const shader = material.current;
    if (!shader) return;

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const targetScroll = Math.min(1, window.scrollY / maxScroll);
    pointer.current.x += (ndc.x - pointer.current.x) * 0.05;
    pointer.current.y += (ndc.y - pointer.current.y) * 0.05;

    shader.uniforms.uTime.value += delta;
    shader.uniforms.uScroll.value += (targetScroll - shader.uniforms.uScroll.value) * 0.06;
    shader.uniforms.uPointer.value = pointer.current;
    shader.uniforms.uColor.value.set(isDark ? "#7fe9ff" : "#0a4a66");
    shader.uniforms.uOpacity.value = isDark ? 0.5 : 0.35;
  });

  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </lineSegments>
  );
}

export default function BackgroundScene() {
  return (
    <Canvas
      camera={{ position: [0, 2.2, 7], fov: 50, near: 0.1, far: 40, rotation: [-0.22, 0, 0] }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop="always"
      aria-hidden="true"
    >
      <ContourLines />
    </Canvas>
  );
}
