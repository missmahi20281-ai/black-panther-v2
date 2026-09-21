import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AvatarState } from '../types';

interface Avatar3DProps {
  state: AvatarState;
  isSpeaking: boolean;
  avatarStyle: 'cyber_cyan' | 'sakura_pink' | 'matrix_emerald' | 'solar_gold';
  onTouch?: () => void;
  onTouchFeedback?: () => void;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({
  state,
  isSpeaking,
  avatarStyle,
  onTouch,
  onTouchFeedback,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const headGroupRef = useRef<THREE.Group | null>(null);
  const mouthMeshRef = useRef<THREE.Mesh | null>(null);
  const leftEyeRef = useRef<THREE.Group | null>(null);
  const rightEyeRef = useRef<THREE.Group | null>(null);
  const leftEyelidRef = useRef<THREE.Mesh | null>(null);
  const rightEyelidRef = useRef<THREE.Mesh | null>(null);
  const haloRef = useRef<THREE.Mesh | null>(null);
  const ringsGroupRef = useRef<THREE.Group | null>(null);
  const lightsRef = useRef<{ main: THREE.PointLight; accent: THREE.PointLight } | null>(null);

  // Mouse tracking target
  const mouseTarget = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseSmooth = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Get theme colors
  const getThemeColor = () => {
    switch (avatarStyle) {
      case 'sakura_pink':
        return { primary: 0xff4081, secondary: 0xff80ab, light: 0xffd1dc, hex: '#ff4081' };
      case 'matrix_emerald':
        return { primary: 0x00e676, secondary: 0x69f0ae, light: 0xb9f6ca, hex: '#00e676' };
      case 'solar_gold':
        return { primary: 0xffd600, secondary: 0xffff00, light: 0xfff9c4, hex: '#ffd600' };
      case 'cyber_cyan':
      default:
        return { primary: 0x00f0ff, secondary: 0x00b0ff, light: 0x80d8ff, hex: '#00f0ff' };
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 340;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 4.0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x182030, 2.5);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(getThemeColor().primary, 3.5, 10);
    mainLight.position.set(1.5, 2.0, 3.0);
    scene.add(mainLight);

    const accentLight = new THREE.PointLight(getThemeColor().secondary, 4.0, 10);
    accentLight.position.set(-1.8, -0.5, 2.5);
    scene.add(accentLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(0, 3, -2);
    scene.add(rimLight);

    lightsRef.current = { main: mainLight, accent: accentLight };

    // --- Build Robotic Anime Female Avatar ---
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Base materials
    const faceMaterial = new THREE.MeshStandardMaterial({
      color: 0xf3e5dc, // Soft porcelain anime skin tone
      roughness: 0.35,
      metalness: 0.1,
    });

    const cyberMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2130,
      roughness: 0.2,
      metalness: 0.85,
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: getThemeColor().primary,
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f1826,
      roughness: 0.25,
      metalness: 0.6,
    });

    const eyeIrisMaterial = new THREE.MeshStandardMaterial({
      color: getThemeColor().primary,
      emissive: getThemeColor().primary,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.3,
    });

    // Head Group (contains neck, head, eyes, hair, cyber accessories)
    const headGroup = new THREE.Group();
    rootGroup.add(headGroup);
    headGroupRef.current = headGroup;

    // 1. Sleek Torso / Cyber Armor Shoulders
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, -1.35, 0);

    const chestGeometry = new THREE.CylinderGeometry(0.55, 0.45, 0.7, 16);
    const chestMesh = new THREE.Mesh(chestGeometry, cyberMetalMaterial);
    torsoGroup.add(chestMesh);

    // Power Core on Chest
    const coreRingGeo = new THREE.TorusGeometry(0.16, 0.03, 16, 32);
    const coreRingMesh = new THREE.Mesh(coreRingGeo, glowMaterial);
    coreRingMesh.position.set(0, 0.05, 0.48);
    torsoGroup.add(coreRingMesh);

    const coreCrystalGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const coreCrystalMesh = new THREE.Mesh(coreCrystalGeo, glowMaterial);
    coreCrystalMesh.position.set(0, 0.05, 0.46);
    torsoGroup.add(coreCrystalMesh);

    // Collar / Cyber Neck
    const neckGeometry = new THREE.CylinderGeometry(0.24, 0.28, 0.45, 16);
    const neckMesh = new THREE.Mesh(neckGeometry, cyberMetalMaterial);
    neckMesh.position.set(0, -0.7, 0);
    headGroup.add(neckMesh);

    // Neck glowing cyber seam ring
    const neckRingGeo = new THREE.TorusGeometry(0.26, 0.018, 12, 32);
    neckRingGeo.rotateX(Math.PI / 2);
    const neckRingMesh = new THREE.Mesh(neckRingGeo, glowMaterial);
    neckRingMesh.position.set(0, -0.68, 0);
    headGroup.add(neckRingMesh);

    rootGroup.add(torsoGroup);

    // 2. Anime Head & Face Shape
    const headGeom = new THREE.SphereGeometry(0.72, 32, 32);
    headGeom.scale(0.92, 1.05, 0.95);
    const headMesh = new THREE.Mesh(headGeom, faceMaterial);
    headMesh.position.set(0, 0.1, 0);
    headGroup.add(headMesh);

    // Chin taper (Anime aesthetic V-line jaw)
    const chinGeom = new THREE.ConeGeometry(0.38, 0.45, 16);
    chinGeom.rotateX(Math.PI);
    chinGeom.scale(1.0, 0.8, 0.8);
    const chinMesh = new THREE.Mesh(chinGeom, faceMaterial);
    chinMesh.position.set(0, -0.42, 0.22);
    headGroup.add(chinMesh);

    // Subtle robotic cheek seam plates
    const cheekSeamGeo = new THREE.TorusGeometry(0.22, 0.01, 8, 16, Math.PI / 2);
    const leftCheekSeam = new THREE.Mesh(cheekSeamGeo, glowMaterial);
    leftCheekSeam.position.set(0.44, -0.15, 0.52);
    leftCheekSeam.rotation.set(0.3, 0.6, -0.2);
    headGroup.add(leftCheekSeam);

    const rightCheekSeam = new THREE.Mesh(cheekSeamGeo, glowMaterial);
    rightCheekSeam.position.set(-0.44, -0.15, 0.52);
    rightCheekSeam.rotation.set(0.3, -0.6, 0.2);
    headGroup.add(rightCheekSeam);

    // 3. Eyes (Anime Expressive Stylized Eyes)
    const createEye = (isLeft: boolean) => {
      const eyeGroup = new THREE.Group();
      const xPos = isLeft ? 0.26 : -0.26;
      eyeGroup.position.set(xPos, 0.12, 0.62);

      // Sclera
      const scleraGeo = new THREE.SphereGeometry(0.15, 16, 16);
      scleraGeo.scale(1.2, 1.4, 0.4);
      const scleraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
      const scleraMesh = new THREE.Mesh(scleraGeo, scleraMat);
      eyeGroup.add(scleraMesh);

      // Iris
      const irisGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.04, 24);
      irisGeo.rotateX(Math.PI / 2);
      irisGeo.scale(1.0, 1.35, 1.0);
      const irisMesh = new THREE.Mesh(irisGeo, eyeIrisMaterial);
      irisMesh.position.set(0, 0, 0.06);
      eyeGroup.add(irisMesh);

      // Pupil / Cyber Ring
      const pupilGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.05, 16);
      pupilGeo.rotateX(Math.PI / 2);
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x020813 });
      const pupilMesh = new THREE.Mesh(pupilGeo, pupilMat);
      pupilMesh.position.set(0, 0, 0.07);
      eyeGroup.add(pupilMesh);

      // Eye highlight (anime sparkle)
      const sparkleGeo = new THREE.SphereGeometry(0.022, 8, 8);
      const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const sparkleMesh = new THREE.Mesh(sparkleGeo, sparkleMat);
      sparkleMesh.position.set(0.03, 0.04, 0.09);
      eyeGroup.add(sparkleMesh);

      // Eyelashes / Upper Lid (dark anime accent)
      const lashGeo = new THREE.TorusGeometry(0.16, 0.022, 8, 16, Math.PI * 0.85);
      lashGeo.rotateZ(isLeft ? -Math.PI * 0.42 : -Math.PI * 0.42);
      const lashMat = new THREE.MeshBasicMaterial({ color: 0x0a0e17 });
      const lashMesh = new THREE.Mesh(lashGeo, lashMat);
      lashMesh.position.set(0, 0.08, 0.05);
      eyeGroup.add(lashMesh);

      // Blinking Eyelid Mesh
      const eyelidGeo = new THREE.SphereGeometry(0.165, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      eyelidGeo.scale(1.25, 1.45, 0.5);
      const eyelidMesh = new THREE.Mesh(eyelidGeo, faceMaterial);
      eyelidMesh.position.set(0, 0, 0.04);
      eyelidMesh.scale.set(1, 0.01, 1); // Open by default
      eyeGroup.add(eyelidMesh);

      if (isLeft) leftEyelidRef.current = eyelidMesh;
      else rightEyelidRef.current = eyelidMesh;

      return eyeGroup;
    };

    const leftEye = createEye(true);
    const rightEye = createEye(false);
    headGroup.add(leftEye);
    headGroup.add(rightEye);
    leftEyeRef.current = leftEye;
    rightEyeRef.current = rightEye;

    // 4. Subtle Anime Nose
    const noseGeo = new THREE.ConeGeometry(0.04, 0.08, 8);
    noseGeo.rotateX(0.2);
    const noseMesh = new THREE.Mesh(noseGeo, faceMaterial);
    noseMesh.position.set(0, -0.06, 0.72);
    headGroup.add(noseMesh);

    // 5. Lip-Sync Mouth Mesh
    const mouthGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI * 0.9);
    mouthGeo.rotateX(Math.PI * 0.9);
    const mouthMat = new THREE.MeshStandardMaterial({
      color: 0xd35d6e,
      roughness: 0.3,
    });
    const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
    mouthMesh.position.set(0, -0.24, 0.66);
    mouthMesh.scale.set(1.0, 0.5, 1.0);
    headGroup.add(mouthMesh);
    mouthMeshRef.current = mouthMesh;

    // 6. Futuristic Cybernetic Headset / Ear Sensors & Antenna
    const createHeadsetEar = (isLeft: boolean) => {
      const earGroup = new THREE.Group();
      const xPos = isLeft ? 0.72 : -0.72;
      earGroup.position.set(xPos, 0.12, 0.05);

      // Ear cup cylinder
      const cupGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.12, 16);
      cupGeo.rotateZ(Math.PI / 2);
      const cupMesh = new THREE.Mesh(cupGeo, cyberMetalMaterial);
      earGroup.add(cupMesh);

      // Glowing center sensor ring
      const ringGeo = new THREE.TorusGeometry(0.12, 0.02, 12, 24);
      ringGeo.rotateY(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeo, glowMaterial);
      earGroup.add(ringMesh);

      // Fin / Antenna
      const finGeo = new THREE.BoxGeometry(0.04, 0.45, 0.12);
      const finMesh = new THREE.Mesh(finGeo, cyberMetalMaterial);
      finMesh.position.set(0, 0.26, -0.08);
      finMesh.rotation.set(-0.35, 0, isLeft ? -0.15 : 0.15);
      earGroup.add(finMesh);

      // Glowing fin tip LED
      const ledGeo = new THREE.SphereGeometry(0.025, 8, 8);
      const ledMesh = new THREE.Mesh(ledGeo, glowMaterial);
      ledMesh.position.set(0, 0.48, -0.16);
      earGroup.add(ledMesh);

      return earGroup;
    };

    const leftEar = createHeadsetEar(true);
    const rightEar = createHeadsetEar(false);
    headGroup.add(leftEar);
    headGroup.add(rightEar);

    // 7. Cyber Hair / Holographic Strands
    const hairGroup = new THREE.Group();
    // Front bangs
    for (let i = -3; i <= 3; i++) {
      const bangGeo = new THREE.CylinderGeometry(0.06, 0.015, 0.45, 8);
      bangGeo.rotateZ(i * 0.12);
      const bangMesh = new THREE.Mesh(bangGeo, hairMaterial);
      bangMesh.position.set(i * 0.16, 0.48 - Math.abs(i) * 0.04, 0.65 - Math.abs(i) * 0.03);
      hairGroup.add(bangMesh);
    }
    // Twin side tails / cyber locks
    const leftTailGeo = new THREE.CylinderGeometry(0.09, 0.03, 1.2, 12);
    leftTailGeo.rotateZ(-0.25);
    const leftTailMesh = new THREE.Mesh(leftTailGeo, hairMaterial);
    leftTailMesh.position.set(0.82, -0.3, -0.05);
    hairGroup.add(leftTailMesh);

    const rightTailGeo = new THREE.CylinderGeometry(0.09, 0.03, 1.2, 12);
    rightTailGeo.rotateZ(0.25);
    const rightTailMesh = new THREE.Mesh(rightTailGeo, hairMaterial);
    rightTailMesh.position.set(-0.82, -0.3, -0.05);
    hairGroup.add(rightTailMesh);

    // Top hair volume
    const topHairGeo = new THREE.SphereGeometry(0.78, 24, 16);
    topHairGeo.scale(1.02, 1.08, 1.05);
    const topHairMesh = new THREE.Mesh(topHairGeo, hairMaterial);
    topHairMesh.position.set(0, 0.22, -0.08);
    hairGroup.add(topHairMesh);

    headGroup.add(hairGroup);

    // 8. Holographic Halo & Status Rings
    const ringsGroup = new THREE.Group();
    headGroup.add(ringsGroup);
    ringsGroupRef.current = ringsGroup;

    const haloGeo = new THREE.TorusGeometry(0.95, 0.018, 16, 48);
    haloGeo.rotateX(Math.PI / 2.3);
    const haloMesh = new THREE.Mesh(haloGeo, glowMaterial);
    haloMesh.position.set(0, 0.75, -0.1);
    ringsGroup.add(haloMesh);
    haloRef.current = haloMesh;

    // Outer orbital ring
    const orbitGeo = new THREE.TorusGeometry(1.2, 0.009, 12, 48);
    orbitGeo.rotateX(Math.PI / 3);
    orbitGeo.rotateY(0.4);
    const orbitMesh = new THREE.Mesh(orbitGeo, glowMaterial);
    orbitMesh.position.set(0, 0.3, 0);
    ringsGroup.add(orbitMesh);

    // Pointer move listener for responsive 3D head/eye tracking
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      mouseTarget.current = {
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
      };
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);

    // Animation variables
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;
    let blinkProgress = 0;

    // Render loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Smooth mouse tracking
      mouseSmooth.current.x += (mouseTarget.current.x - mouseSmooth.current.x) * 0.08;
      mouseSmooth.current.y += (mouseTarget.current.y - mouseSmooth.current.y) * 0.08;

      if (headGroupRef.current) {
        // Subtle natural breathing & idle sway
        const breathY = Math.sin(elapsedTime * 2.2) * 0.025;
        const idleTilt = Math.sin(elapsedTime * 0.8) * 0.03;

        // Base head rotation with pointer tracking
        let targetRotY = mouseSmooth.current.x * 0.35 + idleTilt;
        let targetRotX = -mouseSmooth.current.y * 0.25;
        let targetRotZ = -mouseSmooth.current.x * 0.05;

        // Apply expression specific postures
        if (state === 'thinking') {
          targetRotX -= 0.15;
          targetRotY -= 0.2;
        } else if (state === 'confused') {
          targetRotZ += 0.18;
          targetRotY += 0.1;
        } else if (state === 'happy') {
          targetRotX += Math.sin(elapsedTime * 4.0) * 0.02;
        } else if (state === 'listening') {
          targetRotX += 0.08;
        }

        headGroupRef.current.position.y = breathY;
        headGroupRef.current.rotation.y += (targetRotY - headGroupRef.current.rotation.y) * 0.1;
        headGroupRef.current.rotation.x += (targetRotX - headGroupRef.current.rotation.x) * 0.1;
        headGroupRef.current.rotation.z += (targetRotZ - headGroupRef.current.rotation.z) * 0.1;
      }

      // Eye tracking
      if (leftEyeRef.current && rightEyeRef.current) {
        const eyeLookX = mouseSmooth.current.x * 0.15;
        const eyeLookY = mouseSmooth.current.y * 0.12;
        leftEyeRef.current.rotation.y = eyeLookX;
        leftEyeRef.current.rotation.x = -eyeLookY;
        rightEyeRef.current.rotation.y = eyeLookX;
        rightEyeRef.current.rotation.x = -eyeLookY;
      }

      // Blinking mechanism
      blinkTimer += delta;
      if (blinkTimer > 3.8 && !isBlinking) {
        isBlinking = true;
        blinkTimer = 0;
        blinkProgress = 0;
      }

      if (isBlinking) {
        blinkProgress += delta * 12; // blink duration ~0.15s
        const lidScale = Math.sin(blinkProgress * Math.PI);
        if (leftEyelidRef.current && rightEyelidRef.current) {
          leftEyelidRef.current.scale.y = Math.max(0.01, Math.min(1.0, lidScale));
          rightEyelidRef.current.scale.y = Math.max(0.01, Math.min(1.0, lidScale));
        }
        if (blinkProgress >= 1.0) {
          isBlinking = false;
          if (leftEyelidRef.current && rightEyelidRef.current) {
            leftEyelidRef.current.scale.y = 0.01;
            rightEyelidRef.current.scale.y = 0.01;
          }
        }
      }

      // Lip-Sync and Mouth Movement
      if (mouthMeshRef.current) {
        if (isSpeaking) {
          // Dynamic phonetic bounce during speech
          const phoneme = Math.sin(elapsedTime * 18) * 0.4 + Math.cos(elapsedTime * 24) * 0.3;
          const openAmount = 0.4 + Math.max(0, phoneme);
          mouthMeshRef.current.scale.y = THREE.MathUtils.lerp(mouthMeshRef.current.scale.y, openAmount * 1.8, 0.25);
          mouthMeshRef.current.scale.x = THREE.MathUtils.lerp(mouthMeshRef.current.scale.x, 1.0 + (1 - openAmount) * 0.3, 0.25);
        } else if (state === 'happy') {
          // Cheerful smile
          mouthMeshRef.current.scale.y = 0.8;
          mouthMeshRef.current.scale.x = 1.3;
          mouthMeshRef.current.rotation.z = 0;
        } else if (state === 'confused') {
          // Asymmetric mouth
          mouthMeshRef.current.scale.y = 0.3;
          mouthMeshRef.current.scale.x = 0.8;
          mouthMeshRef.current.rotation.z = 0.15;
        } else {
          // Calm idle
          mouthMeshRef.current.scale.y = THREE.MathUtils.lerp(mouthMeshRef.current.scale.y, 0.4, 0.1);
          mouthMeshRef.current.scale.x = THREE.MathUtils.lerp(mouthMeshRef.current.scale.x, 1.0, 0.1);
          mouthMeshRef.current.rotation.z = 0;
        }
      }

      // Halo & Cyber Ring rotation
      if (ringsGroupRef.current) {
        ringsGroupRef.current.rotation.y = elapsedTime * 0.4;
        if (state === 'thinking' || state === 'processing') {
          ringsGroupRef.current.rotation.y = elapsedTime * 2.2;
        }
      }

      // Dynamic light intensity for speaking / states
      if (lightsRef.current) {
        const theme = getThemeColor();
        let targetColor = theme.primary;
        if (state === 'error') targetColor = 0xff1744;
        else if (state === 'confused') targetColor = 0xff9100;
        else if (state === 'listening') targetColor = 0x00e676;

        lightsRef.current.main.color.setHex(targetColor);
        const speechPulse = isSpeaking ? Math.sin(elapsedTime * 15) * 1.2 : 0;
        lightsRef.current.main.intensity = 3.5 + speechPulse;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      resizeObserver.disconnect();
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [avatarStyle, state, isSpeaking]);

  return (
    <div
      ref={containerRef}
      id="penther-avatar-3d-canvas"
      onClick={() => (onTouchFeedback ? onTouchFeedback() : onTouch?.())}
      className="relative w-full h-80 sm:h-96 flex items-center justify-center cursor-pointer select-none touch-manipulation group"
      title="Tap PENTHER for interaction"
    >
      {/* Subtle background cyber ring indicator */}
      <div
        className="absolute inset-0 pointer-events-none rounded-full blur-3xl opacity-20 transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${getThemeColor().hex} 0%, transparent 70%)`,
        }}
      />
      {/* Hover tap hint */}
      <div className="absolute bottom-2 text-xs font-mono tracking-widest text-cyan-400/50 uppercase transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none">
        [ Tap for Neural Interaction ]
      </div>
    </div>
  );
};
