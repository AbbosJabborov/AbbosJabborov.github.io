import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { GRAPH_DATA } from "../config/nodesData";

export default function NeuralSphere({ onHoverNode = () => {} }) {
  const mountRef = useRef(null);
  const labelsContainerRef = useRef(null);
  const navigate = useNavigate();

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const hoveredNodeRef = useRef(null);
  const activeHoverIdRef = useRef(null);
  const draggedNodeRef = useRef(null);

  // Sound FX synthesizer ref
  const audioCtxRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Orbit, Pan & Zoom camera physics
  const controlsRef = useRef({
    lon: 20,
    lat: 18,
    targetLon: 20,
    targetLat: 18,
    distance: 380,
    targetDistance: 380,
    panX: 0,
    panY: 0,
    targetPanX: 0,
    targetPanY: 0,
    isDraggingCamera: false,
    isPanning: false,
    isDraggingNode: false,
    startX: 0,
    startY: 0,
    startLon: 0,
    startLat: 0,
    startPanX: 0,
    startPanY: 0,
  });

  // Soft Web Audio chime
  const playSound = useCallback((freq = 440, type = "sine", duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not supported or blocked
    }
  }, [soundEnabled]);

  useEffect(() => {
    const container = mountRef.current;
    const labelsContainer = labelsContainerRef.current;
    if (!container || !labelsContainer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(52, width / height, 1, 4000);
    camera.position.set(0, 60, 380);
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

    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // 2. High-Tech Circular Glowing Point Texture
    const createCircleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.3, "rgba(255, 255, 255, 0.95)");
      grad.addColorStop(0.65, "rgba(255, 255, 255, 0.35)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };
    const circleTexture = createCircleTexture();

    // 3. Build Obsidian Graph Nodes (Expanded 3D Star Galaxy Layout)
    const rawNodes = GRAPH_DATA.nodes;
    const rawLinks = GRAPH_DATA.links;

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

    // Expanded 3D Galaxy Cluster Anchors (Wide, spacious layout)
    const clusterPositions = {
      "core-claive": new THREE.Vector3(0, 0, 0),
      "hub-projects": new THREE.Vector3(-190, 85, 55),
      "hub-writing": new THREE.Vector3(180, 110, -40),
      "hub-games": new THREE.Vector3(165, -100, 95),
      "hub-experiments": new THREE.Vector3(-175, -95, -80),
      "hub-socials": new THREE.Vector3(0, 175, 120),
    };

    const nodeObjects = [];
    const interactiveHitList = [];

    const hitGeo = new THREE.SphereGeometry(22, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    // Clear and build HTML Label overlays
    labelsContainer.innerHTML = "";

    rawNodes.forEach((node, index) => {
      let initPos;
      if (clusterPositions[node.id]) {
        initPos = clusterPositions[node.id].clone();
      } else {
        let parentPos = new THREE.Vector3(0, 0, 0);
        for (const [clusterId, pos] of Object.entries(clusterPositions)) {
          if (adjacency.get(node.id)?.has(clusterId)) {
            parentPos = pos;
            break;
          }
        }
        const angle = (index / rawNodes.length) * Math.PI * 2;
        const spread = 70 + (index % 5) * 18;
        const elev = Math.sin(index * 1.8) * 55;
        initPos = new THREE.Vector3(
          parentPos.x + Math.cos(angle) * spread + (Math.random() - 0.5) * 25,
          parentPos.y + elev + (Math.random() - 0.5) * 25,
          parentPos.z + Math.sin(angle) * spread + (Math.random() - 0.5) * 25
        );
      }

      const nodeColor = new THREE.Color(node.color || "#38bdf8");

      // Node 3D Mesh Group
      const group = new THREE.Group();
      group.position.copy(initPos);

      const coreRadius = node.isHub ? (node.id === "core-claive" ? 11 : 8.5) : node.size ? node.size * 0.9 : 5.5;
      const coreGeo = new THREE.SphereGeometry(coreRadius, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.95,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      group.add(coreMesh);

      // Outer Halo for Hubs
      let haloMesh = null;
      if (node.isHub) {
        const haloGeo = new THREE.RingGeometry(coreRadius * 1.35, coreRadius * 1.85, 32);
        const haloMat = new THREE.MeshBasicMaterial({
          color: nodeColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
        });
        haloMesh = new THREE.Mesh(haloGeo, haloMat);
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

      graphGroup.add(group);

      // Create Persistent Floating Label Element (Obsidian Style)
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
        text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9), 0 0 10px ${node.color || "#38bdf8"}44;
        opacity: ${node.isHub ? "0.85" : "0.4"};
        transition: opacity 0.2s ease, transform 0.15s ease, color 0.2s ease;
        white-space: nowrap;
        user-select: none;
        letter-spacing: 0.02em;
        z-index: 10;
      `;
      labelsContainer.appendChild(labelEl);

      const nodeItem = {
        id: node.id,
        data: node,
        pos: initPos.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05
        ),
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

    // 4. Build Obsidian Edge Links BufferGeometry & Dynamic Synaptic Action Potential Pulses
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
          restLength: sourceNode.isHub || targetNode.isHub ? 100 : 75,
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
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      linewidth: 1.2,
    });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    graphGroup.add(edgeLines);

    // 5. Flowing Synaptic Action Potentials (Energy pulses across Obsidian links)
    const pulseCount = 28;
    const pulses = [];
    const pulseGeo = new THREE.SphereGeometry(2.4, 8, 8);

    for (let i = 0; i < pulseCount; i++) {
      const edge = edgePairs[Math.floor(Math.random() * edgePairs.length)];
      if (!edge) continue;

      const pulseColor = edge.source.color.clone().lerp(edge.target.color, 0.5);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: pulseColor,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      pulseMesh.position.copy(edge.source.pos);
      graphGroup.add(pulseMesh);

      pulses.push({
        mesh: pulseMesh,
        edge,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.007,
      });
    }

    // 6. Raycasting, Dragging & 3D Orbit Controls
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane();
    const planeIntersect = new THREE.Vector3();

    const getClientCoords = (e) => {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    };

    const updateRaycast = (clientX, clientY) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveNodesRef.current, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const data = hit.userData.nodeData;
        const group = hit.userData.nodeGroup;

        if (hoveredNodeRef.current !== hit) {
          hoveredNodeRef.current = hit;
          activeHoverIdRef.current = data.id;
          container.style.cursor = "pointer";
          playSound(data.isHub ? 620 : 520, "sine", 0.06);
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

    // Pointer Down: Determine whether user grabbed a node or background space
    const onPointerDown = (e) => {
      const coords = getClientCoords(e);
      const rect = container.getBoundingClientRect();
      mouse.x = ((coords.x - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((coords.y - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveNodesRef.current, false);

      const ctrl = controlsRef.current;
      ctrl.startX = coords.x;
      ctrl.startY = coords.y;

      if (intersects.length > 0 && e.button === 0 && !e.shiftKey) {
        // Physical Node Dragging!
        const hit = intersects[0].object;
        const nodeItem = nodeMap.get(hit.userData.nodeData.id);
        draggedNodeRef.current = nodeItem;
        ctrl.isDraggingNode = true;
        ctrl.isDraggingCamera = false;

        // Set drag plane facing camera at node depth
        dragPlane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()).negate(), nodeItem.pos);
        container.style.cursor = "grabbing";
        playSound(480, "triangle", 0.08);
      } else {
        // Camera Orbit / Pan Dragging
        ctrl.isDraggingCamera = true;
        ctrl.isDraggingNode = false;
        ctrl.isPanning = e.button === 2 || e.shiftKey;
        ctrl.startLon = ctrl.targetLon;
        ctrl.startLat = ctrl.targetLat;
        ctrl.startPanX = ctrl.targetPanX;
        ctrl.startPanY = ctrl.targetPanY;
        container.style.cursor = ctrl.isPanning ? "move" : "grabbing";
      }
    };

    const onPointerMove = (e) => {
      const coords = getClientCoords(e);
      const ctrl = controlsRef.current;
      const rect = container.getBoundingClientRect();
      mouse.x = ((coords.x - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((coords.y - rect.top) / rect.height) * 2 + 1;

      if (ctrl.isDraggingNode && draggedNodeRef.current) {
        // Update physical position of dragged node along plane
        raycaster.setFromCamera(mouse, camera);
        if (raycaster.ray.intersectPlane(dragPlane, planeIntersect)) {
          draggedNodeRef.current.pos.copy(planeIntersect);
          draggedNodeRef.current.velocity.set(0, 0, 0);
        }
      } else if (ctrl.isDraggingCamera) {
        const deltaX = coords.x - ctrl.startX;
        const deltaY = coords.y - ctrl.startY;

        if (ctrl.isPanning) {
          ctrl.targetPanX = ctrl.startPanX - deltaX * 0.45;
          ctrl.targetPanY = ctrl.startPanY + deltaY * 0.45;
        } else {
          ctrl.targetLon = ctrl.startLon + deltaX * 0.4;
          ctrl.targetLat = Math.max(-80, Math.min(80, ctrl.startLat - deltaY * 0.4));
        }
      } else {
        updateRaycast(coords.x, coords.y);
      }
    };

    const onPointerUp = (e) => {
      const coords = getClientCoords(e);
      const ctrl = controlsRef.current;

      const wasNodeDrag = ctrl.isDraggingNode;
      const movedDistance = Math.hypot(coords.x - ctrl.startX, coords.y - ctrl.startY);

      ctrl.isDraggingCamera = false;
      ctrl.isDraggingNode = false;
      ctrl.isPanning = false;

      // If clicked without significant drag, trigger node navigation
      if (wasNodeDrag && movedDistance < 5 && draggedNodeRef.current) {
        const node = draggedNodeRef.current.data;
        playSound(750, "sine", 0.12);

        if (node.node_type === "STORY" && node.slug) {
          navigate(`/story/${node.slug}`);
        } else if (node.url) {
          window.open(node.url, "_blank", "noopener,noreferrer");
        }
      }

      draggedNodeRef.current = null;
      container.style.cursor = hoveredNodeRef.current ? "pointer" : "grab";
    };

    const onWheel = (e) => {
      e.preventDefault();
      const ctrl = controlsRef.current;
      ctrl.targetDistance = Math.max(160, Math.min(750, ctrl.targetDistance + e.deltaY * 0.55));
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

    // 7. Force-Directed 3D Physics Simulation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const ctrl = controlsRef.current;

      // Subtle ambient orbital drift when not actively interacting
      if (!ctrl.isDraggingCamera && !ctrl.isDraggingNode) {
        ctrl.targetLon += 0.035;
      }

      // Smooth camera orbit & zoom lerp
      ctrl.lon += (ctrl.targetLon - ctrl.lon) * 0.08;
      ctrl.lat += (ctrl.targetLat - ctrl.lat) * 0.08;
      ctrl.distance += (ctrl.targetDistance - ctrl.distance) * 0.1;
      ctrl.panX += (ctrl.targetPanX - ctrl.panX) * 0.1;
      ctrl.panY += (ctrl.targetPanY - ctrl.panY) * 0.1;

      const phi = THREE.MathUtils.degToRad(90 - ctrl.lat);
      const theta = THREE.MathUtils.degToRad(ctrl.lon);

      camera.position.x = ctrl.distance * Math.sin(phi) * Math.sin(theta) + ctrl.panX;
      camera.position.y = ctrl.distance * Math.cos(phi) + ctrl.panY;
      camera.position.z = ctrl.distance * Math.sin(phi) * Math.cos(theta);

      camera.lookAt(ctrl.panX, ctrl.panY, 0);

      // ----------------------------------------------------
      // Force Physics: Spring Links, Repulsion & Centering
      // ----------------------------------------------------
      // A. Edge Spring Forces
      edgePairs.forEach((edge) => {
        const delta = edge.target.pos.clone().sub(edge.source.pos);
        const dist = delta.length() || 1;
        const displacement = dist - edge.restLength;
        const springForce = delta.normalize().multiplyScalar(displacement * 0.0032);

        if (edge.source !== draggedNodeRef.current) edge.source.velocity.add(springForce);
        if (edge.target !== draggedNodeRef.current) edge.target.velocity.sub(springForce);
      });

      // B. Node-to-Node Coulomb Repulsion
      for (let i = 0; i < nodeObjects.length; i++) {
        for (let j = i + 1; j < nodeObjects.length; j++) {
          const n1 = nodeObjects[i];
          const n2 = nodeObjects[j];
          const delta = n2.pos.clone().sub(n1.pos);
          const dist = delta.length() || 1;

          if (dist < 220) {
            const repelStrength = (220 - dist) * 0.0019;
            const repel = delta.normalize().multiplyScalar(repelStrength);
            if (n1 !== draggedNodeRef.current) n1.velocity.sub(repel);
            if (n2 !== draggedNodeRef.current) n2.velocity.add(repel);
          }
        }
      }

      // C. Center Gravity & Position Integration
      nodeObjects.forEach((node) => {
        if (node !== draggedNodeRef.current) {
          const centerPull = node.pos.clone().multiplyScalar(-0.0006);
          node.velocity.add(centerPull);
          node.velocity.multiplyScalar(0.92);
          node.pos.add(node.velocity);
        }

        node.group.position.copy(node.pos);

        if (node.haloMesh) {
          node.haloMesh.lookAt(camera.position);
          node.haloMesh.rotation.z += 0.01;
        }
      });

      // ----------------------------------------------------
      // Animate Action Potential Energy Pulses on Edges
      // ----------------------------------------------------
      pulses.forEach((pulse) => {
        pulse.progress += pulse.speed;
        if (pulse.progress > 1) {
          pulse.progress = 0;
        }
        pulse.mesh.position.lerpVectors(pulse.edge.source.pos, pulse.edge.target.pos, pulse.progress);
        const pulseScale = 0.8 + Math.sin(pulse.progress * Math.PI) * 0.6;
        pulse.mesh.scale.set(pulseScale, pulseScale, pulseScale);
      });

      // ----------------------------------------------------
      // Obsidian Highlighting: Neighbor Excitation & HTML Labels
      // ----------------------------------------------------
      const activeHoverId = activeHoverIdRef.current;
      const connectedNeighbors = activeHoverId ? adjacency.get(activeHoverId) : null;
      const rect = container.getBoundingClientRect();

      nodeObjects.forEach((node) => {
        const isHovered = node.id === activeHoverId;
        const isNeighbor = connectedNeighbors?.has(node.id);
        const isFocused = !activeHoverId || isHovered || isNeighbor;

        // Visual Scale & Opacity
        const targetScale = isHovered ? 1.5 : isNeighbor ? 1.2 : activeHoverId ? 0.7 : 1.0;
        node.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.2);

        const targetOpacity = isHovered ? 1.0 : isNeighbor ? 0.95 : activeHoverId ? 0.15 : 0.88;
        node.coreMesh.material.opacity = THREE.MathUtils.lerp(node.coreMesh.material.opacity, targetOpacity, 0.15);

        if (node.haloMesh) {
          node.haloMesh.material.opacity = isHovered ? 0.85 : isFocused ? 0.5 : 0.08;
        }

        // Project Node 3D Position to Screen for HTML Label
        if (node.labelEl) {
          const worldPos = new THREE.Vector3();
          node.group.getWorldPosition(worldPos);
          const screenPos = worldPos.clone().project(camera);

          if (screenPos.z < 1) {
            const screenX = ((screenPos.x + 1) / 2) * rect.width;
            const screenY = ((-screenPos.y + 1) / 2) * rect.height + (node.isHub ? 18 : 14);

            node.labelEl.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate3d(-50%, 0, 0)`;
            node.labelEl.style.display = "block";

            // Dynamic Label Opacity (Obsidian focus behavior)
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
              node.labelEl.style.opacity = node.isHub ? "0.85" : "0.38";
              node.labelEl.style.color = node.isHub ? "#ffffff" : "#cbd5e1";
            }
          } else {
            node.labelEl.style.display = "none";
          }
        }
      });

      // Update Edge Lines Positions & Highlighting Colors
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
            colArray[i6 + c * 3] = 0.24;
            colArray[i6 + c * 3 + 1] = 0.30;
            colArray[i6 + c * 3 + 2] = 0.40;
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
  }, [navigate, onHoverNode, playSound]);

  // Reset Camera View
  const handleResetCamera = () => {
    const ctrl = controlsRef.current;
    ctrl.targetLon = 20;
    ctrl.targetLat = 18;
    ctrl.targetDistance = 380;
    ctrl.targetPanX = 0;
    ctrl.targetPanY = 0;
    playSound(520, "sine", 0.08);
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
          <span>24 Notes • 5 Clusters</span>
        </span>

        <span style={{ color: "rgba(255, 255, 255, 0.15)" }}>|</span>

        <button
          onClick={handleResetCamera}
          title="Reset 3D camera to center"
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




