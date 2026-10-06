"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type OrbSceneProps = {
  palette: number;
  pulseSignal: number;
};

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPulse;
  uniform vec2 uPointer;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vLocalPosition;
  varying vec2 vUv;

  void main() {
    vec3 p = position;
    float t = uTime * 0.68;
    float folds = sin(p.x * 3.7 + t) * cos(p.y * 3.15 - t * 0.72) * 0.072;
    folds += sin(p.z * 7.1 - p.x * 2.3 + t * 0.62) * 0.043;
    folds += cos(p.y * 8.2 + p.z * 2.1 - t * 0.46) * 0.023;
    float pointerSculpt = dot(normalize(position), normalize(vec3(uPointer * 0.55, 1.0)));
    folds += pointerSculpt * sin(p.x * 3.2 + t * 0.42) * 0.032;
    folds += max(pointerSculpt, 0.0) * uPulse * 0.14;
    p += normal * folds;

    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = -viewPosition.xyz;
    vLocalPosition = normalize(position);
    vUv = uv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uPulse;
  uniform int uPalette;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vLocalPosition;
  varying vec2 vUv;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 viewDirection = normalize(vViewPosition);
    vec3 keyLight = normalize(vec3(-0.52, 0.76, 0.94));
    float diffuse = max(dot(n, keyLight), 0.0);
    float fresnel = pow(1.0 - max(dot(n, viewDirection), 0.0), 2.55);

    float meridian = atan(vLocalPosition.z, vLocalPosition.x);
    float folds = sin(vLocalPosition.y * 4.6 + sin(meridian * 2.8 + uTime * 0.21) * 1.35 + uTime * 0.29) * 0.5 + 0.5;
    float glint = sin(meridian * 2.1 - vLocalPosition.y * 7.8 + uTime * 0.18) * 0.5 + 0.5;
    float seam = smoothstep(0.81, 0.97, glint) * 0.28;

    vec3 deep = uPalette == 0 ? vec3(0.035, 0.018, 0.105) : vec3(0.11, 0.025, 0.09);
    vec3 mainTint = uPalette == 0 ? vec3(0.43, 0.27, 0.94) : vec3(1.0, 0.29, 0.19);
    vec3 midTint = uPalette == 0 ? vec3(1.0, 0.23, 0.51) : vec3(1.0, 0.62, 0.17);
    vec3 livingEdge = uPalette == 0 ? vec3(0.73, 1.0, 0.4) : vec3(0.63, 1.0, 0.59);
    vec3 pearl = vec3(1.0, 0.91, 0.8);

    vec3 pigment = mix(deep, mainTint, smoothstep(0.12, 0.89, folds));
    pigment = mix(pigment, midTint, smoothstep(0.52, 0.98, glint) * 0.78);
    pigment = mix(pigment, livingEdge, smoothstep(0.7, 0.94, 1.0 - folds) * 0.66);
    pigment = mix(pigment, pearl, seam);

    float lighting = 0.26 + diffuse * 0.79;
    vec3 lit = pigment * lighting;
    lit += livingEdge * fresnel * (0.58 + uPulse * 0.38);
    lit += pearl * pow(max(dot(reflect(-keyLight, n), viewDirection), 0.0), 34.0) * 0.94;
    lit += midTint * (pow(max(dot(n, -keyLight), 0.0), 2.0) * 0.13);

    gl_FragColor = vec4(lit, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function OrbScene({ palette, pulseSignal }: OrbSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef({ palette, pulseSignal });
  const invalidateRef = useRef<() => void>(() => {});

  useEffect(() => {
    controlRef.current = { palette, pulseSignal };
    invalidateRef.current();
  }, [palette, pulseSignal]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: window.innerWidth > 720,
        powerPreference: "low-power",
        stencil: false,
      });
    } catch {
      host.classList.add("orb-webgl-unsupported");
      return () => host.classList.remove("orb-webgl-unsupported");
    }

    const pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.2 : 1.55);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(Math.max(host.clientWidth, 1), Math.max(host.clientHeight, 1), false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute(
      "aria-label",
      "Escultura de material iridiscente en tres dimensiones; arrastra para girarla 360 grados o usa las flechas del teclado",
    );
    renderer.domElement.setAttribute("class", "orb-webgl-canvas");
    renderer.domElement.setAttribute("tabindex", "0");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 40);
    camera.position.set(0, 0, 6.9);

    const sculpture = new THREE.Group();
    scene.add(sculpture);

    const uniforms = {
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPalette: { value: palette },
    };

    const sphereGeometry = new THREE.SphereGeometry(1.37, 96, 72);
    const liquidMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });
    const heart = new THREE.Mesh(sphereGeometry, liquidMaterial);
    heart.rotation.set(-0.11, 0.06, 0.12);
    sculpture.add(heart);

    const orbit = new THREE.Group();
    sculpture.add(orbit);

    const ringMaterialOne = new THREE.MeshBasicMaterial({
      color: 0xd8cdff,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const ringOne = new THREE.Mesh(new THREE.TorusGeometry(1.79, 0.008, 8, 176), ringMaterialOne);
    ringOne.rotation.set(1.04, 0.18, 0.21);
    orbit.add(ringOne);

    const ringMaterialTwo = new THREE.MeshBasicMaterial({
      color: 0xc7fa79,
      transparent: true,
      opacity: 0.61,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(2.02, 0.005, 8, 176), ringMaterialTwo);
    ringTwo.rotation.set(0.69, 0.9, -0.67);
    orbit.add(ringTwo);

    const ringMaterialThree = new THREE.MeshBasicMaterial({
      color: 0xff997b,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const ringThree = new THREE.Mesh(new THREE.TorusGeometry(2.13, 0.004, 7, 160), ringMaterialThree);
    ringThree.rotation.set(1.45, -0.67, -0.16);
    orbit.add(ringThree);

    const moteCount = 270;
    const motePositions = new Float32Array(moteCount * 3);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < moteCount; i += 1) {
      const y = 1 - (i / Math.max(moteCount - 1, 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = goldenAngle * i;
      const orbitRadius = 2.06 + ((i * 17) % 11) * 0.061;
      motePositions[i * 3] = Math.cos(angle) * radius * orbitRadius;
      motePositions[i * 3 + 1] = y * orbitRadius;
      motePositions[i * 3 + 2] = Math.sin(angle) * radius * orbitRadius;
    }
    const moteGeometry = new THREE.BufferGeometry();
    moteGeometry.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
    const moteMaterial = new THREE.PointsMaterial({
      color: 0xe1fba0,
      size: 0.019,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.76,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const motes = new THREE.Points(moteGeometry, moteMaterial);
    orbit.add(motes);

    const glintGeometry = new THREE.SphereGeometry(0.048, 20, 16);
    const glintMaterial = new THREE.MeshBasicMaterial({
      color: 0xe3ffb0,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });
    const satellite = new THREE.Mesh(glintGeometry, glintMaterial);
    satellite.position.set(1.88, 0.11, 0.22);
    orbit.add(satellite);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointerTarget = new THREE.Vector2(0, 0);
    let elapsed = 0;
    let lastFrameTime = performance.now();
    let pulseEnergy = 0;
    let lastPulseSignal = pulseSignal;
    let disposed = false;
    // Giro libre 360° controlado por el usuario (arrastre + inercia).
    let userYaw = 0;
    let userPitch = 0;
    let velYaw = 0;
    let velPitch = 0;
    let dragging = false;
    let lastDragX = 0;
    let lastDragY = 0;
    let lastDragTime = 0;
    const MAX_PITCH = 1.15;
    const MAX_VELOCITY = 7;

    const drawFrame = () => {
      if (disposed || document.hidden) {
        renderer.setAnimationLoop(null);
        return;
      }

      const now = performance.now();
      const delta = Math.min(Math.max((now - lastFrameTime) / 1000, 0), 0.045);
      lastFrameTime = now;
      if (!reducedMotion) elapsed += delta;

      const latest = controlRef.current;
      uniforms.uPalette.value = latest.palette;
      if (latest.pulseSignal !== lastPulseSignal) {
        lastPulseSignal = latest.pulseSignal;
        pulseEnergy = 1;
      }

      if (!reducedMotion) {
        const blend = 1 - Math.exp(-delta * 4.3);
        uniforms.uPointer.value.lerp(pointerTarget, blend);
        if (!dragging) {
          // Inercia tras soltar + giro automático suave cuando está quieta.
          userYaw += velYaw * delta;
          userPitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, userPitch + velPitch * delta));
          const damping = Math.exp(-delta * 2.6);
          velYaw *= damping;
          velPitch *= damping;
          if (Math.abs(velYaw) < 0.002) velYaw = 0;
          if (Math.abs(velPitch) < 0.002) velPitch = 0;
          userYaw += delta * 0.105;
        }
        // Base 360° del usuario + leve paralaje del cursor encima.
        sculpture.rotation.y = userYaw + uniforms.uPointer.value.x * 0.12;
        sculpture.rotation.x = userPitch + uniforms.uPointer.value.y * 0.08;
        heart.rotation.y = Math.sin(elapsed * 0.21) * 0.13;
        heart.rotation.z = Math.cos(elapsed * 0.18) * 0.06;
        orbit.rotation.y += delta * 0.035;
        ringOne.rotation.z += delta * 0.038;
        ringTwo.rotation.x -= delta * 0.022;
        motes.rotation.y -= delta * 0.013;
        satellite.position.x = Math.cos(elapsed * 0.62) * 1.95;
        satellite.position.y = Math.sin(elapsed * 0.91) * 0.3;
        satellite.position.z = Math.sin(elapsed * 0.62) * 0.52;
      } else {
        uniforms.uPointer.value.lerp(pointerTarget, 0.25);
        sculpture.rotation.y = userYaw;
        sculpture.rotation.x = userPitch;
      }

      pulseEnergy *= Math.exp(-delta * 1.65);
      uniforms.uTime.value = reducedMotion ? 0 : elapsed;
      uniforms.uPulse.value = pulseEnergy;
      renderer.render(scene, camera);

      if (reducedMotion && !dragging && pulseEnergy <= 0.006) {
        renderer.setAnimationLoop(null);
      }
    };

    const invalidate = () => {
      if (!document.hidden && !disposed) {
        lastFrameTime = performance.now();
        renderer.setAnimationLoop(drawFrame);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      dragging = true;
      lastDragX = event.clientX;
      lastDragY = event.clientY;
      lastDragTime = performance.now();
      velYaw = 0;
      velPitch = 0;
      host.classList.add("is-dragging");
      try {
        renderer.domElement.setPointerCapture(event.pointerId);
      } catch {
        /* Algunos navegadores pueden rechazar la captura; el arrastre sigue funcionando. */
      }
      invalidate();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      if (bounds.width && bounds.height) {
        pointerTarget.set(
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
        );
      }
      if (dragging) {
        const now = performance.now();
        const dx = event.clientX - lastDragX;
        const dy = event.clientY - lastDragY;
        const dt = Math.max((now - lastDragTime) / 1000, 1 / 240);
        lastDragX = event.clientX;
        lastDragY = event.clientY;
        lastDragTime = now;
        // ~360° de giro horizontal en un arrastre de pantalla completa.
        const yawDelta = (dx / Math.max(bounds.width || 320, 280)) * Math.PI * 2 * 0.9;
        const pitchDelta = (dy / Math.max(bounds.height || 320, 280)) * Math.PI * 1.1;
        userYaw += yawDelta;
        userPitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, userPitch + pitchDelta));
        if (!reducedMotion) {
          const instantYaw = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, yawDelta / dt));
          const instantPitch = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, pitchDelta / dt));
          velYaw = velYaw * 0.75 + instantYaw * 0.25;
          velPitch = velPitch * 0.75 + instantPitch * 0.25;
        }
      }
      if (reducedMotion) invalidate();
    };

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      host.classList.remove("is-dragging");
      if (reducedMotion) {
        velYaw = 0;
        velPitch = 0;
        invalidate();
      }
    };

    const handlePointerLeave = () => {
      if (dragging) return;
      pointerTarget.set(0, 0);
      if (reducedMotion) invalidate();
    };

    const handleCanvasKeyDown = (event: KeyboardEvent) => {
      const step = 0.3;
      let handled = true;
      switch (event.key) {
        case "ArrowLeft":
          userYaw -= step;
          velYaw = 0;
          break;
        case "ArrowRight":
          userYaw += step;
          velYaw = 0;
          break;
        case "ArrowUp":
          userPitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, userPitch - 0.2));
          velPitch = 0;
          break;
        case "ArrowDown":
          userPitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, userPitch + 0.2));
          velPitch = 0;
          break;
        default:
          handled = false;
      }
      if (handled) {
        event.preventDefault();
        invalidate();
      }
    };

    const handleResize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.position.z = host.clientWidth < 430 ? 6.95 : 6.65;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      invalidate();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        renderer.setAnimationLoop(null);
      } else {
        lastFrameTime = performance.now();
        invalidate();
      }
    };

    invalidateRef.current = invalidate;
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove, { passive: true });
    renderer.domElement.addEventListener("pointerup", endDrag);
    renderer.domElement.addEventListener("pointercancel", endDrag);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    renderer.domElement.addEventListener("keydown", handleCanvasKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(host);
    handleResize();

    return () => {
      disposed = true;
      invalidateRef.current = () => {};
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      host.classList.remove("is-dragging");
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", endDrag);
      renderer.domElement.removeEventListener("pointercancel", endDrag);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      renderer.domElement.removeEventListener("keydown", handleCanvasKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="orb-webgl-host" />;
}
