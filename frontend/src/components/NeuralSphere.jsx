import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { GRAPH_DATA } from "../config/nodesData";

export default function NeuralSphere({ onHoverNode = () => {} }) {
  const mountRef = useRef(null);
  const labelsContainerRef = useRef(null);
  const warpOverlayRef = useRef(null);
  const navigate = useNavigate();

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const interactiveNodesRef = useRef([]);
  const hoveredNodeRef = useRef(null);
  const activeHoverIdRef = useRef(null);
  const isFlyingRef = useRef(false);

  // Audio state & synthesis refs
  const audioCtxRef = useRef(null);
  const ambientHumRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Interaction tracking for idle breathing ramp
  const lastInteractionTimeRef = useRef(Date.now());
  const mouseRay3DRef = useRef(new THREE.Vector3(0, 0, 1));
  const isMouseInsideRef = useRef(false);

  // 360° Interior Look Physics & Zoom Lerping
  const rotationRef = useRef({
    lon: 0,
    lat: 5,
    targetLon: 0,
    targetLat: 5,
    fov: 65,
    targetFov: 65,
    isDragging: false,
    startX: 0,
    startY: 0,
    startLon: 0,
    startLat: 0,
    startPinchDist: 0,
    startFov: 65,
  });


  // Sound FX synthesizer with spatial panning and harmonic frequencies
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Subtle atmospheric ambient drone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 note
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(110, ctx.currentTime); // A2 note

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(220, ctx.currentTime);

      gain.gain.setValueAtTime(0.012, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      ambientHumRef.current = { osc1, osc2, gain, filter };
    } catch {
      // Audio context blocked or not supported
    }
  }, []);

  const playSpatialSound = useCallback(
    (freq = 440, type = "sine", duration = 0.08, panX = 0, volume = 0.04) => {
      if (!soundEnabled) return;
      initAudio();
      try {
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        // Spatial Stereo Panner if supported
        if (ctx.createStereoPanner) {
          const panner = ctx.createStereoPanner();
          panner.pan.setValueAtTime(Math.max(-1, Math.min(1, panX)), ctx.currentTime);
          osc.connect(gain);
          gain.connect(panner);
          panner.connect(ctx.destination);
        } else {
          osc.connect(gain);
          gain.connect(ctx.destination);
        }

        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        // Ignored
      }
    },
    [soundEnabled, initAudio]
  );

  const playWarpSound = useCallback(() => {
    if (!soundEnabled) return;
    initAudio();
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    } catch {
      // Ignored
    }
  }, [soundEnabled, initAudio]);

  const sphericalToCartesian = useCallback((r, phi, theta) => {
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    const labelsContainer = labelsContainerRef.current;
    if (!container || !labelsContainer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Three.js Scene Setup (Interior Camera Perspective)
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(65, width / height, 1, 3000);
    camera.position.set(0, 0, 0.01);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    // 2. High-Tech Radiant Particle Texture (for shining pulses and stars)
    const createShiningParticleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.2, "rgba(255, 255, 255, 0.95)");
      grad.addColorStop(0.5, "rgba(220, 240, 255, 0.5)");
      grad.addColorStop(0.8, "rgba(100, 200, 255, 0.15)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };
    const shiningTexture = createShiningParticleTexture();

    // 3. Deep 3D Celestial Starfield (Tiny twinkling stars in the background)
    const starCount = 750;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starTwinkleOffsets = new Float32Array(starCount);

    const starColorChoices = [
      new THREE.Color(0xf8fafc), // Silver white
      new THREE.Color(0x93c5fd), // Pale sky blue
      new THREE.Color(0xc4b5fd), // Soft violet
      new THREE.Color(0x6ee7b7), // Soft mint
    ];

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const starDist = 900 + Math.random() * 800; // Far background shell
      const phi = Math.acos(1 - 2 * Math.random());
      const theta = Math.random() * Math.PI * 2;

      const starPos = sphericalToCartesian(starDist, phi, theta);
      starPositions[i3] = starPos.x;
      starPositions[i3 + 1] = starPos.y;
      starPositions[i3 + 2] = starPos.z;

      const chosenColor = starColorChoices[Math.floor(Math.random() * starColorChoices.length)];
      starColors[i3] = chosenColor.r;
      starColors[i3 + 1] = chosenColor.g;
      starColors[i3 + 2] = chosenColor.b;

      starTwinkleOffsets[i] = Math.random() * Math.PI * 2;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      vertexColors: true,
      size: 2.2,
      map: shiningTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starField = new THREE.Points(starGeo, starMat);
    sphereGroup.add(starField);

    // 4. Build Spherical Knowledge Graph with Loading Assembly Spawn Points
    const rawNodes = GRAPH_DATA.nodes;
    const rawLinks = GRAPH_DATA.links;
    const sphereRadius = 280;


    const nodeMap = new Map();
    const adjacency = new Map();

    rawNodes.forEach((node) => {
      adjacency.set(node.id, new Set());
    });

    rawLinks.forEach((link) => {
      if (adjacency.has(link.source) && adjacency.has(link.target)) {
        adjacency.get(link.source).add(link.target);
        adjacency.get(link.target).add(link.source);
      }
    });

    // Spherical Coordinates for Major Hubs
    const clusterSphericalAngles = {
      "core-claive": { phi: Math.PI * 0.5, theta: 0 },
      "hub-projects": { phi: Math.PI * 0.38, theta: Math.PI * 0.45 },
      "hub-writing": { phi: Math.PI * 0.35, theta: Math.PI * 1.15 },
      "hub-games": { phi: Math.PI * 0.65, theta: Math.PI * 0.8 },
      "hub-experiments": { phi: Math.PI * 0.68, theta: Math.PI * 1.6 },
      "hub-socials": { phi: Math.PI * 0.32, theta: Math.PI * 1.85 },
    };

    const nodeObjects = [];
    const interactiveHitList = [];

    const hitGeo = new THREE.SphereGeometry(20, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    labelsContainer.innerHTML = "";

    rawNodes.forEach((node, index) => {
      let phi, theta;

      if (clusterSphericalAngles[node.id]) {
        phi = clusterSphericalAngles[node.id].phi;
        theta = clusterSphericalAngles[node.id].theta;
      } else {
        let parentAngles = { phi: Math.PI * 0.5, theta: Math.PI * 0.5 };
        for (const [clusterId, angles] of Object.entries(clusterSphericalAngles)) {
          if (adjacency.get(node.id)?.has(clusterId)) {
            parentAngles = angles;
            break;
          }
        }
        const angleOffset = (index % 4) * (Math.PI * 0.5);
        const radiusOffset = 0.14 + (index % 3) * 0.05;
        phi = Math.max(0.15, Math.min(Math.PI - 0.15, parentAngles.phi + Math.sin(angleOffset) * radiusOffset));
        theta = parentAngles.theta + Math.cos(angleOffset) * radiusOffset * 1.5;
      }

      const targetPos = sphericalToCartesian(sphereRadius, phi, theta);
      // Chaotic scattered dust origin position for the Loading Intro sequence
      const dustDistance = 700 + Math.random() * 500;
      const dustPos = sphericalToCartesian(
        dustDistance,
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2
      );

      const nodeColor = new THREE.Color(node.color || "#38bdf8");

      // Node 3D Mesh
      const group = new THREE.Group();
      group.position.copy(dustPos);

      const coreRadius = node.isHub ? (node.id === "core-claive" ? 9 : 7) : node.size ? node.size * 0.75 : 4.5;
      const coreGeo = new THREE.SphereGeometry(coreRadius, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.0, // Fades in on intro assembly
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      group.add(coreMesh);

      // Outer Halo Ring for Hubs
      let haloMesh = null;
      if (node.isHub) {
        const haloGeo = new THREE.RingGeometry(coreRadius * 1.35, coreRadius * 1.85, 32);
        const haloMat = new THREE.MeshBasicMaterial({
          color: nodeColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.0,
          blending: THREE.AdditiveBlending,
        });
        haloMesh = new THREE.Mesh(haloGeo, haloMat);
        haloMesh.lookAt(0, 0, 0);
        group.add(haloMesh);
      }

      // Invisible Raycast Hit Box
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = {
        nodeData: node,
        nodeGroup: group,
        coreMesh,
        haloMesh,
        originalColor: nodeColor,
      };
      group.add(hitMesh);
      interactiveHitList.push(hitMesh);

      sphereGroup.add(group);

      // Floating Typography Label
      const labelEl = document.createElement("div");
      labelEl.className = "obsidian-node-label";
      labelEl.textContent = node.label;
      labelEl.dataset.nodeId = node.id;
      labelEl.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        transform: translate3d(-50%, -50%, 0);
        pointer-events: none;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-size: ${node.isHub ? (node.id === "core-claive" ? "14px" : "12px") : "11px"};
        font-weight: ${node.isHub ? "700" : "500"};
        color: #f1f5f9;
        text-shadow: 0 1px 6px rgba(0, 0, 0, 0.95), 0 0 10px ${node.color || "#38bdf8"}44;
        opacity: 0;
        transition: opacity 0.25s ease, transform 0.15s ease, color 0.2s ease;
        white-space: nowrap;
        user-select: none;
        letter-spacing: 0.02em;
        z-index: 10;
      `;
      labelsContainer.appendChild(labelEl);

      const nodeItem = {
        id: node.id,
        data: node,
        pos: dustPos.clone(),
        targetPos: targetPos.clone(),
        basePos: targetPos.clone(),
        phi,
        theta,
        group,
        coreMesh,
        haloMesh,
        hitMesh,
        labelEl,
        color: nodeColor,
        isHub: !!node.isHub,
      };

      nodeMap.set(node.id, nodeItem);
      nodeObjects.push(nodeItem);
    });

    interactiveNodesRef.current = interactiveHitList;

    // 3. Build Obsidian Edge Links BufferGeometry
    const edgePairs = [];
    rawLinks.forEach((link) => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);
      if (sourceNode && targetNode) {
        edgePairs.push({
          source: sourceNode,
          target: targetNode,
          sourceId: link.source,
          targetId: link.target,
        });
      }
    });

    const edgePositions = new Float32Array(edgePairs.length * 6);
    const edgeColors = new Float32Array(edgePairs.length * 6);

    for (let i = 0; i < edgePairs.length; i++) {
      const i6 = i * 6;
      for (let c = 0; c < 2; c++) {
        edgeColors[i6 + c * 3] = 0.22;
        edgeColors[i6 + c * 3 + 1] = 0.28;
        edgeColors[i6 + c * 3 + 2] = 0.38;
      }
    }

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3).setUsage(THREE.DynamicDrawUsage));
    edgeGeo.setAttribute("color", new THREE.BufferAttribute(edgeColors, 3).setUsage(THREE.DynamicDrawUsage));

    const edgeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.0, // Fades in on assembly
      blending: THREE.AdditiveBlending,
      linewidth: 1.2,
    });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    sphereGroup.add(edgeLines);

    // 5. Volumetric Shining Action Potential Pulses along edges (Compact & Radiant)
    const trailCount = 55;
    const trails = [];
    const trailGeo = new THREE.SphereGeometry(1.0, 8, 8); // Compact sleek size

    for (let i = 0; i < trailCount; i++) {
      const edge = edgePairs[Math.floor(Math.random() * edgePairs.length)];
      if (!edge) continue;

      const baseShineColor = edge.source.color.clone().lerp(edge.target.color, Math.random());
      // Boost radiance for intense shine
      baseShineColor.addScalar(0.35);

      const trailMat = new THREE.MeshBasicMaterial({
        color: baseShineColor,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });
      const trailMesh = new THREE.Mesh(trailGeo, trailMat);
      trailMesh.position.copy(edge.source.pos);
      sphereGroup.add(trailMesh);

      trails.push({
        mesh: trailMesh,
        edge,
        progress: Math.random(),
        speed: 0.0035 + Math.random() * 0.0055,
        wobbleOffset: Math.random() * 10,
        baseScale: 0.8 + Math.random() * 0.5,
      });
    }

    // 6. Raycasting & Magnetism Handlers
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();


    const getClientCoords = (e) => {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    };

    const updateRaycast = (clientX, clientY) => {
      lastInteractionTimeRef.current = Date.now();
      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      mouseRay3DRef.current.copy(raycaster.ray.direction).multiplyScalar(sphereRadius);
      isMouseInsideRef.current = true;

      const intersects = raycaster.intersectObjects(interactiveNodesRef.current, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const data = hit.userData.nodeData;
        const group = hit.userData.nodeGroup;

        if (hoveredNodeRef.current !== hit) {
          hoveredNodeRef.current = hit;
          activeHoverIdRef.current = data.id;
          container.style.cursor = "pointer";

          // Parallax audio: frequency harmonic + stereo pan based on mouse X
          const harmonicFreqs = [440, 554.37, 659.25, 880, 987.77];
          const freq = harmonicFreqs[Math.abs(data.label.length) % harmonicFreqs.length];
          playSpatialSound(data.isHub ? freq * 1.25 : freq, "sine", 0.09, mouse.x, 0.05);
        }

        const worldPos = new THREE.Vector3();
        group.getWorldPosition(worldPos);
        const screenPos = worldPos.clone().project(camera);

        const screenX = ((screenPos.x + 1) / 2) * rect.width + rect.left;
        const screenY = ((-screenPos.y + 1) / 2) * rect.height + rect.top;

        onHoverNode({
          node: data,
          screenX,
          screenY,
          isVisible: screenPos.z < 1,
        });
      } else {
        if (hoveredNodeRef.current) {
          hoveredNodeRef.current = null;
          activeHoverIdRef.current = null;
          container.style.cursor = "grab";
          onHoverNode(null);
        }
      }
    };

    const onPointerDown = (e) => {
      lastInteractionTimeRef.current = Date.now();
      initAudio();
      const coords = getClientCoords(e);
      const rot = rotationRef.current;
      rot.isDragging = true;
      rot.startX = coords.x;
      rot.startY = coords.y;
      rot.startLon = rot.targetLon;
      rot.startLat = rot.targetLat;

      if (e.touches && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        rot.startPinchDist = Math.hypot(dx, dy);
        rot.startFov = rot.targetFov;
      }

      container.style.cursor = "grabbing";
    };

    const onPointerMove = (e) => {
      const coords = getClientCoords(e);
      const rot = rotationRef.current;

      if (rot.isDragging) {
        lastInteractionTimeRef.current = Date.now();

        // Handle Mobile 2-finger Pinch Zoom
        if (e.touches && e.touches.length === 2 && rot.startPinchDist > 0) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const currentPinchDist = Math.hypot(dx, dy);
          const pinchFactor = rot.startPinchDist / Math.max(1, currentPinchDist);
          rot.targetFov = Math.max(35, Math.min(85, rot.startFov * pinchFactor));
          return;
        }

        // Smooth controlled rotation drag
        const deltaX = (coords.x - rot.startX) * 0.085;
        const deltaY = (coords.y - rot.startY) * 0.085;

        rot.targetLon = rot.startLon - deltaX;
        rot.targetLat = Math.max(-80, Math.min(80, rot.startLat + deltaY));
      } else {
        updateRaycast(coords.x, coords.y);
      }
    };

    // Smooth Mouse Wheel Zoom (FOV adjustment)
    const onWheel = (e) => {
      e.preventDefault();
      lastInteractionTimeRef.current = Date.now();
      const rot = rotationRef.current;
      rot.targetFov = Math.max(35, Math.min(85, rot.targetFov + e.deltaY * 0.04));
    };

    // Node Click → Camera Warp Flythrough Transition
    const triggerWarpFlythrough = (targetNode) => {
      if (isFlyingRef.current) return;
      isFlyingRef.current = true;
      playWarpSound();

      // Show Warp Speed Overlay
      if (warpOverlayRef.current) {
        warpOverlayRef.current.style.opacity = "1";
      }

      const startPos = camera.position.clone();
      const targetWorldPos = targetNode.pos.clone().multiplyScalar(0.92); // Fly right up to the node
      const startFov = camera.fov;
      const startTime = performance.now();
      const flyDuration = 650; // ms

      const flyStep = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / flyDuration);
        const ease = Math.pow(progress, 3); // Accelerating warp curve

        camera.position.lerpVectors(startPos, targetWorldPos, ease);
        camera.fov = THREE.MathUtils.lerp(startFov, 115, ease); // Hyperspace FOV stretch
        camera.updateProjectionMatrix();

        if (progress < 1) {
          requestAnimationFrame(flyStep);
        } else {
          // Warp arrival: navigate or open link
          const nodeData = targetNode.data;
          if (nodeData.node_type === "STORY" && nodeData.slug) {
            navigate(`/story/${nodeData.slug}`);
          } else if (nodeData.url) {
            window.open(nodeData.url, "_blank", "noopener,noreferrer");
            // Reset warp position smoothly after opening external link
            setTimeout(() => {
              camera.position.set(0, 0, 0.01);
              camera.fov = rotationRef.current.fov;
              camera.updateProjectionMatrix();
              if (warpOverlayRef.current) warpOverlayRef.current.style.opacity = "0";
              isFlyingRef.current = false;
            }, 300);
          }
        }
      };

      requestAnimationFrame(flyStep);
    };

    const onPointerUp = (e) => {
      lastInteractionTimeRef.current = Date.now();
      const coords = getClientCoords(e);
      const rot = rotationRef.current;
      const movedDistance = Math.hypot(coords.x - rot.startX, coords.y - rot.startY);
      rot.isDragging = false;
      rot.startPinchDist = 0;

      if (movedDistance < 5 && hoveredNodeRef.current && !isFlyingRef.current) {
        const nodeItem = nodeMap.get(hoveredNodeRef.current.userData.nodeData.id);
        if (nodeItem) {
          triggerWarpFlythrough(nodeItem);
        }
      }

      container.style.cursor = hoveredNodeRef.current ? "pointer" : "grab";
    };

    const onContextMenu = (e) => e.preventDefault();

    container.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("contextmenu", onContextMenu);

    container.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);


    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 6. Main Physics, Loading Intro & Intensified Idle Breathing Loop
    let animationFrameId;
    const mountStartTime = performance.now();
    const introDuration = 2200; // 2.2s assembly sequence

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const elapsedTime = (now - mountStartTime) * 0.001;
      const rot = rotationRef.current;


      // Loading Intro Assembly Progress (0 -> 1 with elastic ease-out)
      const introProgress = Math.min(1, (now - mountStartTime) / introDuration);
      const introEase = 1 - Math.pow(1 - introProgress, 3);

      // Idle Breathing Ramp Calculation:
      // The longer without interaction, the more intense the organic breathing
      const idleTimeSeconds = (Date.now() - lastInteractionTimeRef.current) / 1000;
      // Idle factor scales smoothly from 1.0 (just interacted) up to 4.5 (idle for 12s+)
      const idleIntensity = THREE.MathUtils.clamp(1.0 + Math.max(0, idleTimeSeconds - 2) * 0.35, 1.0, 4.5);

      // Gentle ambient drift, slower and more cinematic
      if (!rot.isDragging && !isFlyingRef.current) {
        rot.targetLon += 0.012 * (1 + (idleIntensity - 1) * 0.2);
      }

      // Smooth camera look & FOV zoom interpolation (silky lerping)
      if (!isFlyingRef.current) {
        rot.lon += (rot.targetLon - rot.lon) * 0.045;
        rot.lat += (rot.targetLat - rot.lat) * 0.045;
        rot.fov += (rot.targetFov - rot.fov) * 0.055;

        camera.fov = rot.fov;
        camera.updateProjectionMatrix();

        const phi = THREE.MathUtils.degToRad(90 - rot.lat);
        const theta = THREE.MathUtils.degToRad(rot.lon);

        const targetX = 500 * Math.sin(phi) * Math.cos(theta);
        const targetY = 500 * Math.cos(phi);
        const targetZ = 500 * Math.sin(phi) * Math.sin(theta);

        camera.lookAt(targetX, targetY, targetZ);
      }


      // Dynamic Node Positioning: Assembly Intro + Idle Breathing + Cursor Magnetism
      const mouseRay3D = mouseRay3DRef.current;
      const isMouseActive = isMouseInsideRef.current && !rot.isDragging;

      nodeObjects.forEach((node, idx) => {
        // A. Loading Intro Assembly: lerp from scattered dust position into sphere target
        const currentTargetPos = node.basePos;
        node.pos.lerpVectors(node.pos, currentTargetPos, introEase * 0.08 + 0.02);

        // B. Organic Idle Breathing: Amplitude & frequency scale with idleIntensity
        const breathAmp = (2.2 + Math.sin(idx * 1.3) * 1.2) * idleIntensity;
        const breathSpeed = (1.5 + (idx % 3) * 0.3) * (1 + (idleIntensity - 1) * 0.3);
        const breathOffset = Math.sin(elapsedTime * breathSpeed + idx * 0.7) * breathAmp;

        const currentR = sphereRadius + breathOffset;
        const sphericalPos = sphericalToCartesian(currentR, node.phi, node.theta);

        // C. Cursor Magnetism: Nearby nodes lean toward cursor direction
        if (isMouseActive && introProgress >= 0.8) {
          const distToMouseRay = sphericalPos.distanceTo(mouseRay3D);
          if (distToMouseRay < 130) {
            const pullForce = ((130 - distToMouseRay) / 130) * 18;
            const pullDir = mouseRay3D.clone().sub(sphericalPos).normalize();
            sphericalPos.add(pullDir.multiplyScalar(pullForce));
          }
        }

        // Apply position
        node.pos.lerp(sphericalPos, 0.1);
        node.group.position.copy(node.pos);

        // Fade in node materials during intro assembly
        if (introProgress < 1) {
          node.coreMesh.material.opacity = introEase * 0.95;
          if (node.haloMesh) node.haloMesh.material.opacity = introEase * 0.5;
        }

        if (node.haloMesh) {
          node.haloMesh.rotation.z += 0.01 * (1 + (idleIntensity - 1) * 0.2);
        }
      });

      // Edge opacity fade in
      if (introProgress < 1) {
        edgeMat.opacity = introEase * 0.45;
        starMat.opacity = introEase * 0.65;
      } else {
        // Subtle cosmic starfield twinkling
        starMat.opacity = 0.55 + Math.sin(elapsedTime * 1.5) * 0.12;
      }

      // Animate flowing shining trail dust particles along edges
      trails.forEach((trail) => {
        trail.progress += trail.speed * (1 + (idleIntensity - 1) * 0.2);
        if (trail.progress > 1) {
          trail.progress = 0;
        }
        trail.mesh.position.lerpVectors(trail.edge.source.pos, trail.edge.target.pos, trail.progress);
        // Subtle transverse cosmic drift
        trail.mesh.position.y += Math.sin(elapsedTime * 3 + trail.wobbleOffset) * 1.2;
        // Twinkling scale as it travels across the link
        const pulseTwinkle = (0.7 + Math.sin(trail.progress * Math.PI) * 0.75) * trail.baseScale;
        trail.mesh.scale.set(pulseTwinkle, pulseTwinkle, pulseTwinkle);
      });


      // ----------------------------------------------------
      // Obsidian Highlighting: Neighbor Excitation & Screen Labels
      // ----------------------------------------------------
      const activeHoverId = activeHoverIdRef.current;
      const connectedNeighbors = activeHoverId ? adjacency.get(activeHoverId) : null;
      const rect = container.getBoundingClientRect();

      nodeObjects.forEach((node) => {
        const isHovered = node.id === activeHoverId;
        const isNeighbor = connectedNeighbors?.has(node.id);
        const isFocused = !activeHoverId || isHovered || isNeighbor;

        // Visual Scale & Opacity
        const targetScale = isHovered
          ? 1.55
          : isNeighbor
          ? 1.25
          : activeHoverId
          ? 0.75
          : 1.0 + Math.sin(elapsedTime * 2 + node.phi) * (0.04 * idleIntensity);
        node.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.2);

        const targetOpacity = isHovered ? 1.0 : isNeighbor ? 0.95 : activeHoverId ? 0.15 : 0.88;
        node.coreMesh.material.opacity = THREE.MathUtils.lerp(node.coreMesh.material.opacity, targetOpacity, 0.15);

        if (node.haloMesh) {
          node.haloMesh.material.opacity = isHovered ? 0.9 : isFocused ? 0.5 : 0.08;
        }

        // Project 3D position to screen for label (only display once intro is almost assembled)
        if (node.labelEl && introProgress > 0.6) {
          const worldPos = new THREE.Vector3();
          node.group.getWorldPosition(worldPos);
          const screenPos = worldPos.clone().project(camera);

          if (screenPos.z < 1 && screenPos.x > -1.1 && screenPos.x < 1.1 && screenPos.y > -1.1 && screenPos.y < 1.1) {
            const screenX = ((screenPos.x + 1) / 2) * rect.width;
            const screenY = ((-screenPos.y + 1) / 2) * rect.height + (node.isHub ? 16 : 13);

            node.labelEl.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate3d(-50%, 0, 0)`;
            node.labelEl.style.display = "block";

            if (isHovered) {
              node.labelEl.style.opacity = "1";
              node.labelEl.style.color = "#ffffff";
              node.labelEl.style.fontWeight = "700";
            } else if (isNeighbor) {
              node.labelEl.style.opacity = "0.95";
              node.labelEl.style.color = "#e2e8f0";
              node.labelEl.style.fontWeight = "600";
            } else if (activeHoverId) {
              node.labelEl.style.opacity = "0.05";
              node.labelEl.style.color = "#64748b";
            } else {
              node.labelEl.style.opacity = node.isHub ? "0.9" : "0.45";
              node.labelEl.style.color = node.isHub ? "#ffffff" : "#cbd5e1";
            }
          } else {
            node.labelEl.style.display = "none";
          }
        }
      });

      // Update Edge Positions & Colors
      const posArray = edgeGeo.attributes.position.array;
      const colArray = edgeGeo.attributes.color.array;

      edgePairs.forEach((edge, idx) => {
        const i6 = idx * 6;
        posArray[i6] = edge.source.pos.x;
        posArray[i6 + 1] = edge.source.pos.y;
        posArray[i6 + 2] = edge.source.pos.z;

        posArray[i6 + 3] = edge.target.pos.x;
        posArray[i6 + 4] = edge.target.pos.y;
        posArray[i6 + 5] = edge.target.pos.z;

        const isEdgeConnected =
          activeHoverId && (edge.sourceId === activeHoverId || edge.targetId === activeHoverId);
        const isAnyHover = !!activeHoverId;

        for (let c = 0; c < 2; c++) {
          const baseColor = c === 0 ? edge.source.color : edge.target.color;
          if (isEdgeConnected) {
            colArray[i6 + c * 3] = baseColor.r * 1.3;
            colArray[i6 + c * 3 + 1] = baseColor.g * 1.3;
            colArray[i6 + c * 3 + 2] = baseColor.b * 1.3;
          } else if (isAnyHover) {
            colArray[i6 + c * 3] = 0.05;
            colArray[i6 + c * 3 + 1] = 0.06;
            colArray[i6 + c * 3 + 2] = 0.09;
          } else {
            // Idle breathing pulse brightness along filaments
            const idleBrightness = 0.24 + Math.sin(elapsedTime * 2 + idx) * (0.05 * idleIntensity);
            colArray[i6 + c * 3] = idleBrightness;
            colArray[i6 + c * 3 + 1] = idleBrightness * 1.25;
            colArray[i6 + c * 3 + 2] = idleBrightness * 1.6;
          }
        }
      });

      edgeGeo.attributes.position.needsUpdate = true;
      edgeGeo.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("contextmenu", onContextMenu);
      container.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);

      edgeGeo.dispose();
      edgeMat.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [sphericalToCartesian, navigate, onHoverNode, playSpatialSound, playWarpSound, initAudio]);

  // Reset Look Direction & Zoom
  const handleResetLook = () => {
    lastInteractionTimeRef.current = Date.now();
    const rot = rotationRef.current;
    rot.targetLon = 0;
    rot.targetLat = 5;
    rot.targetFov = 65;
    playSpatialSound(520, "sine", 0.08, 0, 0.05);
  };


  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          cursor: "grab",
          userSelect: "none",
          zIndex: 1,
        }}
      />

      {/* HTML Floating Node Labels Container */}
      <div
        ref={labelsContainerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 5,
        }}
      />

      {/* Cinematic Warp Flythrough Radial Blur Overlay */}
      <div
        ref={warpOverlayRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          opacity: 0,
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(168, 85, 247, 0.25) 50%, rgba(3, 5, 10, 0.8) 100%)",
          boxShadow: "inset 0 0 100px rgba(0, 240, 255, 0.4)",
          transition: "opacity 0.45s ease-out",
          zIndex: 50,
        }}
      />

      {/* Minimalist Bottom Telemetry & Controls */}
      <div
        style={{
          position: "fixed",
          bottom: "16px",
          left: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          zIndex: 20,
          background: "rgba(10, 16, 28, 0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "6px 14px",
          borderRadius: "999px",
          fontSize: "12px",
          color: "#94a3b8",
          userSelect: "none",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a855f7" }} />
          <span>24 Notes • 5 Clusters • 360° Celestial Sphere</span>
        </span>

        <span style={{ color: "rgba(255, 255, 255, 0.15)" }}>|</span>

        <button
          onClick={handleResetLook}
          title="Reset 360° look direction to center"
          style={{
            background: "transparent",
            border: "none",
            color: "#38bdf8",
            cursor: "pointer",
            fontSize: "12px",
            padding: 0,
          }}
        >
          Reset View
        </button>

        <span style={{ color: "rgba(255, 255, 255, 0.15)" }}>|</span>

        <button
          onClick={() => setSoundEnabled((prev) => !prev)}
          title={soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
          style={{
            background: "transparent",
            border: "none",
            color: soundEnabled ? "#34d399" : "#64748b",
            cursor: "pointer",
            fontSize: "12px",
            padding: 0,
          }}
        >
          {soundEnabled ? "Audio On" : "Audio Off"}
        </button>
      </div>
    </div>
  );
}


