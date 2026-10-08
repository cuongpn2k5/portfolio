import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ProfileData } from '../../types';
import { createIDCardTextures, createStrapTexture } from './cardTextures';

interface IDCard3DProps {
  profile: ProfileData;
  entranceTrigger?: boolean;
  isIntroActive?: boolean;
  onInteractionChange?: (active: boolean) => void;
}

const STRAP_SEGMENTS = 32;
const STRAP_WIDTH = 0.24; // Flat ribbon lanyard width matching Image 2
const STRAP_THICKNESS = 0.012; // Realistic fabric ribbon thickness
const FIXED_TIMESTEP = 1 / 120;
const MAX_SUBSTEPS = 6;
const CARD_MASS = 1.35;
const DRAG_STIFFNESS = 72;
const DRAG_DAMPING = 15;
const MAX_DRAG_FORCE = 105;
const STRAP_STIFFNESS = 210;
const STRAP_DAMPING = 20;
// 0.57s is 40% shorter than the previous 0.95s entrance.
const ENTRANCE_DURATION = 0.57;
const ENTRANCE_GRAVITY = -9.81;
const ENTRANCE_START_X_OFFSET = -0.04;
const ENTRANCE_HANDOFF_X_OFFSET = 0.18;
const ENTRANCE_REBOUND_HEIGHT_RATIO = 0.07;

type PhysicsPhase =
  | 'entrance'
  | 'catch'
  | 'rebound'
  | 'settling'
  | 'interactive'
  | 'dragging'
  | 'released';

const limitLength = (vector: THREE.Vector3, maximum: number) => {
  if (vector.lengthSq() > maximum * maximum) vector.setLength(maximum);
  return vector;
};

export const IDCard3D: React.FC<IDCard3DProps> = ({
  profile,
  entranceTrigger = true,
  isIntroActive = false,
  onInteractionChange,
}) => {
  const { camera, viewport, gl } = useThree();

  const cardGroupRef = useRef<THREE.Group>(null);
  const hitMeshRef = useRef<THREE.Mesh>(null);
  const strapMeshRef = useRef<THREE.Mesh>(null);
  const claspGroupRef = useRef<THREE.Group>(null);

  const isDraggingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);

  // Responsive scale & anchor configuration
  const isDesktop = viewport.width > 7.0;
  const cardScale = 1.15 * (isDesktop ? 1.0 : Math.min(1.0, Math.max(0.72, viewport.width / 6.2)));

  // Anchor sits near top of the viewport
  // Desktop: hangs over right column (~25% right of center), matching reference
  // Mobile: slightly right of center
  const anchorPos = useMemo(() => {
    const x = isDesktop ? viewport.width * 0.25 : viewport.width * 0.08;
    const y = viewport.height * 0.5 + 0.08; // Anchored at top edge
    return new THREE.Vector3(x, y, 0);
  }, [isDesktop, viewport.width, viewport.height]);

  // Target visible strap length matching Image 3:
  // Mobile reference viewport: ~220-260px vertical distance
  // Responsive desktop: ~280-310px vertical distance
  const strapLength = useMemo(() => {
    const pxPerUnit =
      typeof window !== 'undefined' && window.innerHeight > 0
        ? window.innerHeight / viewport.height
        : 110;

    const targetPx = isDesktop
      ? Math.min(310, Math.max(260, window.innerHeight * 0.31))
      : 240;
    const targetUnits = targetPx / pxPerUnit;

    return Math.min(2.55, Math.max(1.85, targetUnits));
  }, [viewport.height, isDesktop]);

  const cardDims = useMemo(() => {
    return {
      w: 1.7 * cardScale,
      h: 2.55 * cardScale,
      d: 0.04 * cardScale,
    };
  }, [cardScale]);

  // Textures
  const { frontTexture, backTexture } = useMemo(
    () => createIDCardTextures(profile),
    [profile]
  );
  const strapTexture = useMemo(() => createStrapTexture(), []);

  const waitsForEntrance = isIntroActive && !entranceTrigger;
  const phaseRef = useRef<PhysicsPhase>(waitsForEntrance ? 'entrance' : 'settling');
  const entranceStartedRef = useRef(!waitsForEntrance);
  const entranceStartTimeRef = useRef(0);

  // Trigger controlled descent when signaled
  useEffect(() => {
    if (entranceTrigger && phaseRef.current === 'entrance' && !entranceStartedRef.current) {
      entranceStartedRef.current = true;
      entranceStartTimeRef.current = performance.now();
    }
  }, [entranceTrigger]);

  const topClipOffset = cardDims.h * 0.5 + 0.08 * cardScale;
  const restingPosition = useMemo(
    () => new THREE.Vector3(anchorPos.x, anchorPos.y - strapLength - topClipOffset, 0),
    [anchorPos, strapLength, topClipOffset]
  );

  const initialQuaternion = useMemo(
    () => new THREE.Quaternion().setFromEuler(new THREE.Euler(0.1, 0, -0.12)),
    []
  );

  // A compact rigid-body state. Position and orientation are advanced only by
  // the entrance lifecycle or the fixed-step force solver below.
  const physicsRef = useRef({
    pos: waitsForEntrance
      ? new THREE.Vector3(
          anchorPos.x + ENTRANCE_START_X_OFFSET,
          anchorPos.y + cardDims.h + 0.8,
          0
        )
      : restingPosition.clone(),
    vel: new THREE.Vector3(0, 0, 0),
    quaternion: waitsForEntrance ? initialQuaternion.clone() : new THREE.Quaternion(),
    angularVel: new THREE.Vector3(0, 0, 0),
    localGrab: new THREE.Vector3(),
    pointerTarget: new THREE.Vector3(),
    pointerVelocity: new THREE.Vector3(),
    lastPointerTarget: new THREE.Vector3(),
    lastPointerTime: 0,
    dragPlane: new THREE.Plane(),
    mouseNDC: new THREE.Vector2(),
    accumulator: 0,
    restTime: 0,
    elapsedTime: 0,
    entranceCatchPending: waitsForEntrance,
    reboundElapsed: 0,
  });

  const previousAnchorRef = useRef(anchorPos.clone());

  // Keep the current motion when the viewport changes instead of resetting the
  // simulation. Translating by the anchor delta preserves the hanging pose.
  useEffect(() => {
    const p = physicsRef.current;
    const anchorDelta = anchorPos.clone().sub(previousAnchorRef.current);
    p.pos.add(anchorDelta);
    p.pointerTarget.add(anchorDelta);
    p.lastPointerTarget.add(anchorDelta);
    previousAnchorRef.current.copy(anchorPos);
  }, [anchorPos]);

  // ── 3D Ribbon Fabric Strap BufferGeometry ──────────────────────────────
  // Constructs a 4-vertex ring per segment: FrontLeft, FrontRight, BackLeft, BackRight
  // Complete with front face, back face, and stitched edge strips.
  const strapGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const ringCount = STRAP_SEGMENTS + 1;
    const vertexCount = ringCount * 4;
    const indexCount = STRAP_SEGMENTS * 8 * 3; // 8 triangles per segment

    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const indices = new Uint16Array(indexCount);

    const vRepeat = 2.2; // ~2 bold "ID CARD" prints visible along lanyard

    for (let i = 0; i < ringCount; i++) {
      const v = (i / STRAP_SEGMENTS) * vRepeat;
      const base = i * 4;

      // Front-Left
      uvs[base * 2] = 0.02;
      uvs[base * 2 + 1] = v;

      // Front-Right
      uvs[(base + 1) * 2] = 0.98;
      uvs[(base + 1) * 2 + 1] = v;

      // Back-Left (mirrored so text reads correctly on back face)
      uvs[(base + 2) * 2] = 0.98;
      uvs[(base + 2) * 2 + 1] = v;

      // Back-Right
      uvs[(base + 3) * 2] = 0.02;
      uvs[(base + 3) * 2 + 1] = v;
    }

    let idx = 0;
    for (let i = 0; i < STRAP_SEGMENTS; i++) {
      const r0 = i * 4;
      const r1 = (i + 1) * 4;

      // Front Face
      indices[idx++] = r0 + 0;
      indices[idx++] = r1 + 0;
      indices[idx++] = r0 + 1;

      indices[idx++] = r0 + 1;
      indices[idx++] = r1 + 0;
      indices[idx++] = r1 + 1;

      // Back Face
      indices[idx++] = r0 + 2;
      indices[idx++] = r0 + 3;
      indices[idx++] = r1 + 2;

      indices[idx++] = r0 + 3;
      indices[idx++] = r1 + 3;
      indices[idx++] = r1 + 2;

      // Left Edge
      indices[idx++] = r0 + 0;
      indices[idx++] = r0 + 2;
      indices[idx++] = r1 + 0;

      indices[idx++] = r0 + 2;
      indices[idx++] = r1 + 2;
      indices[idx++] = r1 + 0;

      // Right Edge
      indices[idx++] = r0 + 1;
      indices[idx++] = r1 + 1;
      indices[idx++] = r0 + 3;

      indices[idx++] = r0 + 3;
      indices[idx++] = r1 + 1;
      indices[idx++] = r1 + 3;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.setIndex(new THREE.BufferAttribute(indices, 1));

    return geom;
  }, []);

  // ── Non-blocking Pointer Isolation & Dynamic Capture ──────────────────
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();
    const pointerWorld = new THREE.Vector3();

    const getNDC = (e: PointerEvent) => {
      const bounds = gl.domElement.getBoundingClientRect();
      const ndcX = ((e.clientX - bounds.left) / bounds.width) * 2 - 1;
      const ndcY = -((e.clientY - bounds.top) / bounds.height) * 2 + 1;
      return { ndcX, ndcY };
    };

    const handleWindowPointerMove = (e: PointerEvent) => {
      const p = physicsRef.current;
      const { ndcX, ndcY } = getNDC(e);
      mouseVec.set(ndcX, ndcY);
      p.mouseNDC.set(ndcX, ndcY);

      if (isDraggingRef.current) {
        if (activePointerIdRef.current !== e.pointerId) return;
        // Update only the virtual handle. The rigid body follows through a
        // spring force in the fixed-step solver; its center is never teleported.
        raycaster.setFromCamera(mouseVec, camera);
        if (raycaster.ray.intersectPlane(p.dragPlane, pointerWorld)) {
          const now = performance.now();
          const pointerDt = Math.max((now - p.lastPointerTime) / 1000, 1 / 240);
          const maxReach = strapLength * 1.45 + cardDims.h;
          const fromAnchor = pointerWorld.clone().sub(anchorPos);
          if (fromAnchor.length() > maxReach) {
            pointerWorld.copy(anchorPos).add(fromAnchor.setLength(maxReach));
          }

          const measuredVelocity = pointerWorld
            .clone()
            .sub(p.lastPointerTarget)
            .divideScalar(pointerDt);
          limitLength(measuredVelocity, 12);
          p.pointerVelocity.lerp(measuredVelocity, 0.35);
          p.pointerTarget.copy(pointerWorld);
          p.lastPointerTarget.copy(pointerWorld);
          p.lastPointerTime = now;
        }
      } else {
        // Not dragging: test if pointer is hovering over card
        raycaster.setFromCamera(mouseVec, camera);
        const hitTarget = hitMeshRef.current;
        if (hitTarget) {
          const intersects = raycaster.intersectObject(hitTarget, false);
          if (intersects.length > 0) {
            onInteractionChange?.(true);
          } else {
            onInteractionChange?.(false);
          }
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Floating navigation and theme controls remain independent of the canvas.
      if (e.target instanceof Element && e.target.closest('header, button, a, [role="dialog"]')) return;
      if (phaseRef.current !== 'interactive' && phaseRef.current !== 'released') return;
      const { ndcX, ndcY } = getNDC(e);
      mouseVec.set(ndcX, ndcY);

      raycaster.setFromCamera(mouseVec, camera);
      const hitTarget = hitMeshRef.current;
      if (hitTarget) {
        const intersects = raycaster.intersectObject(hitTarget, false);
        if (intersects.length > 0 && cardGroupRef.current) {
          e.preventDefault();
          e.stopPropagation();

          isDraggingRef.current = true;
          activePointerIdRef.current = e.pointerId;
          phaseRef.current = 'dragging';
          onInteractionChange?.(true);

          const p = physicsRef.current;
          const hitPoint = intersects[0].point.clone();
          cardGroupRef.current.updateWorldMatrix(true, false);
          p.localGrab.copy(cardGroupRef.current.worldToLocal(hitPoint.clone()));

          const planeNormal = camera.getWorldDirection(new THREE.Vector3());
          p.dragPlane.setFromNormalAndCoplanarPoint(planeNormal, hitPoint);
          p.pointerTarget.copy(hitPoint);
          p.lastPointerTarget.copy(hitPoint);
          p.pointerVelocity.set(0, 0, 0);
          p.lastPointerTime = performance.now();
          p.restTime = 0;
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (
        isDraggingRef.current &&
        (activePointerIdRef.current === null || activePointerIdRef.current === e.pointerId)
      ) {
        isDraggingRef.current = false;
        activePointerIdRef.current = null;
        phaseRef.current = 'released';
        physicsRef.current.pointerVelocity.set(0, 0, 0);

        const p = physicsRef.current;
        raycaster.setFromCamera(p.mouseNDC, camera);
        const hitTarget = hitMeshRef.current;
        if (hitTarget) {
          const intersects = raycaster.intersectObject(hitTarget, false);
          if (intersects.length === 0) {
            onInteractionChange?.(false);
          }
        }
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [camera, gl, anchorPos, strapLength, cardDims.h, onInteractionChange]);

  // ── Physics & Animation Frame ──────────────────────────────────────────
  useFrame((_, delta) => {
    const p = physicsRef.current;
    const frameDt = Math.min(delta, 0.05);
    p.elapsedTime += frameDt;
    const isDragging = isDraggingRef.current;

    if (phaseRef.current === 'entrance' && !entranceStartedRef.current) {
      p.pos.set(
        anchorPos.x + ENTRANCE_START_X_OFFSET,
        anchorPos.y + cardDims.h + 0.8,
        0
      );
      p.quaternion.copy(initialQuaternion);
      p.vel.set(0, 0, 0);
      p.angularVel.set(0, 0, 0);
    } else if (phaseRef.current === 'entrance') {
      const now = performance.now();
      const elapsed = (now - entranceStartTimeRef.current) / 1000;
      const dropTime = Math.min(ENTRANCE_DURATION, Math.max(0, elapsed));
      const progress = dropTime / ENTRANCE_DURATION;
      const startPos = new THREE.Vector3(
        anchorPos.x + ENTRANCE_START_X_OFFSET,
        anchorPos.y + cardDims.h + 0.8,
        0
      );
      const targetPos = restingPosition
        .clone()
        .add(new THREE.Vector3(ENTRANCE_HANDOFF_X_OFFSET, 0.1, 0));

      // Solve the initial velocity so the card reaches the handoff point in
      // exactly ENTRANCE_DURATION while accelerating under gravity.
      const entranceAcceleration = new THREE.Vector3(0, ENTRANCE_GRAVITY, 0);
      const initialVelocity = targetPos
        .clone()
        .sub(startPos)
        .addScaledVector(
          entranceAcceleration,
          -0.5 * ENTRANCE_DURATION * ENTRANCE_DURATION
        )
        .divideScalar(ENTRANCE_DURATION);

      p.pos
        .copy(startPos)
        .addScaledVector(initialVelocity, dropTime)
        .addScaledVector(entranceAcceleration, 0.5 * dropTime * dropTime);
      p.vel.copy(initialVelocity).addScaledVector(entranceAcceleration, dropTime);

      const targetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.045));
      p.quaternion.copy(initialQuaternion).slerp(targetQuaternion, progress);

      if (progress >= 1.0) {
        phaseRef.current = 'catch';
        p.entranceCatchPending = true;
        // The ballistic velocity is preserved. Gravity and the lanyard now
        // provide the visible deceleration, small swing, and final settling.
        p.angularVel.set(0, 0, 0.12);
      }
    } else {
      p.accumulator = Math.min(p.accumulator + frameDt, FIXED_TIMESTEP * MAX_SUBSTEPS);
      let substeps = 0;

      while (p.accumulator >= FIXED_TIMESTEP && substeps < MAX_SUBSTEPS) {
        const dt = FIXED_TIMESTEP;
        const force = new THREE.Vector3(0, -9.81 * CARD_MASS, -p.pos.z * 18 - p.vel.z * 5);
        const torque = new THREE.Vector3();

        const addForceAtPoint = (appliedForce: THREE.Vector3, offset: THREE.Vector3) => {
          force.add(appliedForce);
          torque.add(new THREE.Vector3().crossVectors(offset, appliedForce));
        };

        // Fabric lanyard: slack when close, increasingly taut at its rest
        // length. Applying tension at the top clip naturally rights the card.
        const clipOffset = new THREE.Vector3(0, topClipOffset, 0).applyQuaternion(p.quaternion);
        const clipWorld = p.pos.clone().add(clipOffset);
        const outward = clipWorld.clone().sub(anchorPos);
        const clipDistance = outward.length();
        if (clipDistance > 0.0001) {
          outward.divideScalar(clipDistance);
          const clipVelocity = p.vel.clone().add(
            new THREE.Vector3().crossVectors(p.angularVel, clipOffset)
          );
          const radialVelocity = clipVelocity.dot(outward);
          const extension = clipDistance - strapLength;
          if (extension > 0) {
            const magnitude = Math.max(
              0,
              extension * STRAP_STIFFNESS + Math.max(0, radialVelocity) * STRAP_DAMPING
            );
            addForceAtPoint(outward.clone().multiplyScalar(-magnitude), clipOffset);
          }
        }

        // A damped virtual handle pulls the exact point that was grabbed.
        // Applying it off-center creates real torque; no rotation is authored.
        if (isDragging) {
          const grabOffset = p.localGrab.clone().applyQuaternion(p.quaternion);
          const grabWorld = p.pos.clone().add(grabOffset);
          const grabVelocity = p.vel.clone().add(
            new THREE.Vector3().crossVectors(p.angularVel, grabOffset)
          );
          const dragForce = p.pointerTarget
            .clone()
            .sub(grabWorld)
            .multiplyScalar(DRAG_STIFFNESS)
            .add(p.pointerVelocity.clone().sub(grabVelocity).multiplyScalar(DRAG_DAMPING));
          limitLength(dragForce, MAX_DRAG_FORCE);
          addForceAtPoint(dragForce, grabOffset);
        }

        p.vel.addScaledVector(force, dt / CARD_MASS);

        // Box inertia in local space, transformed back to world space.
        const inverseInertia = new THREE.Vector3(
          12 / (CARD_MASS * (cardDims.h * cardDims.h + cardDims.d * cardDims.d)),
          12 / (CARD_MASS * (cardDims.w * cardDims.w + cardDims.d * cardDims.d)),
          12 / (CARD_MASS * (cardDims.w * cardDims.w + cardDims.h * cardDims.h))
        );
        const inverseRotation = p.quaternion.clone().invert();
        const localTorque = torque.clone().applyQuaternion(inverseRotation);
        localTorque.multiply(inverseInertia);
        p.angularVel.addScaledVector(localTorque.applyQuaternion(p.quaternion), dt);

        p.vel.multiplyScalar(Math.exp(-0.85 * dt));
        p.angularVel.multiplyScalar(Math.exp(-2.1 * dt));
        // Preserve the faster entrance momentum until the strap catches it;
        // normal interaction retains the original, lower safety cap.
        const isEntranceMotion =
          phaseRef.current === 'catch' ||
          phaseRef.current === 'rebound' ||
          phaseRef.current === 'settling';
        limitLength(p.vel, isEntranceMotion ? 16 : 11);
        limitLength(p.angularVel, 8);
        p.pos.addScaledVector(p.vel, dt);

        const angularSpeed = p.angularVel.length();
        if (angularSpeed > 0.00001) {
          const deltaRotation = new THREE.Quaternion().setFromAxisAngle(
            p.angularVel.clone().divideScalar(angularSpeed),
            angularSpeed * dt
          );
          p.quaternion.premultiply(deltaRotation).normalize();
        }

        // Non-stretch positional solve for the strap. It corrects only excess
        // length and removes outward velocity, preserving tangential momentum.
        const solvedClipOffset = new THREE.Vector3(0, topClipOffset, 0).applyQuaternion(p.quaternion);
        const solvedClip = p.pos.clone().add(solvedClipOffset);
        const solvedOutward = solvedClip.sub(anchorPos);
        const solvedDistance = solvedOutward.length();
        if (solvedDistance > strapLength * 1.025) {
          solvedOutward.divideScalar(solvedDistance);
          p.pos.addScaledVector(solvedOutward, -(solvedDistance - strapLength * 1.025));
          const outwardSpeed = p.vel.dot(solvedOutward);
          if (outwardSpeed > 0) {
            if (p.entranceCatchPending && phaseRef.current === 'catch') {
              // Convert a small part of the impact into inward velocity. The
              // target speed corresponds to a theoretical rebound of about 7%
              // of the card height under gravity, while the incoming-energy
              // cap prevents the constraint from adding artificial energy.
              const targetReboundSpeed = Math.sqrt(
                2 * Math.abs(ENTRANCE_GRAVITY) * cardDims.h * ENTRANCE_REBOUND_HEIGHT_RATIO
              );
              const reboundSpeed = Math.min(targetReboundSpeed, outwardSpeed * 0.16);
              p.vel.addScaledVector(
                solvedOutward,
                -(outwardSpeed + reboundSpeed)
              );
              p.entranceCatchPending = false;
              p.reboundElapsed = 0;
              phaseRef.current = 'rebound';
            } else {
              p.vel.addScaledVector(solvedOutward, -outwardSpeed * 0.85);
            }
          }
        }

        if (phaseRef.current === 'rebound') {
          p.reboundElapsed += dt;
          if (p.reboundElapsed >= 0.22) phaseRef.current = 'settling';
        }

        p.accumulator -= dt;
        substeps += 1;
      }

      p.pointerVelocity.multiplyScalar(Math.exp(-10 * frameDt));

      if (
        !isDragging &&
        (phaseRef.current === 'settling' ||
          phaseRef.current === 'released' ||
          phaseRef.current === 'interactive')
      ) {
        if (p.vel.lengthSq() < 0.0025 && p.angularVel.lengthSq() < 0.0025) {
          p.restTime += frameDt;
          if (p.restTime > 0.7) phaseRef.current = 'interactive';
        } else {
          p.restTime = 0;
        }
      }
    }

    // Apply translation & rotation to Card Group
    if (cardGroupRef.current) {
      cardGroupRef.current.position.copy(p.pos);
      cardGroupRef.current.quaternion.copy(p.quaternion);
      cardGroupRef.current.updateMatrixWorld();
    }

    // ── Update Dynamic 3D Ribbon Fabric Strap Mesh ───────────────────────
    if (strapMeshRef.current) {
      const geom = strapMeshRef.current.geometry;
      const posAttr = geom.attributes.position;
      const normAttr = geom.attributes.normal;
      const posArr = posAttr.array as Float32Array;
      const normArr = normAttr.array as Float32Array;

      // Card top clip in world coordinates
      const cardClipWorld = new THREE.Vector3(0, topClipOffset, 0);
      cardClipWorld.applyQuaternion(p.quaternion).add(p.pos);

      const dist = anchorPos.distanceTo(cardClipWorld);
      const sag = Math.max(0, strapLength - dist) * 0.65;
      const strapWidth = STRAP_WIDTH * cardScale;
      const strapThick = STRAP_THICKNESS * cardScale;

      // Direction vectors for twist interpolation
      const anchorNorm = new THREE.Vector3(0, 0, 1);
      const cardNorm = new THREE.Vector3(0, 0, 1).applyQuaternion(p.quaternion);

      // Pre-sample spine points along the curve
      const spinePoints: THREE.Vector3[] = [];
      for (let i = 0; i <= STRAP_SEGMENTS; i++) {
        const t = i / STRAP_SEGMENTS;
        const pt = new THREE.Vector3().lerpVectors(anchorPos, cardClipWorld, t);

        if (sag > 0) {
          const sagFactor = Math.sin(t * Math.PI);
          pt.y -= sag * sagFactor;
          pt.z += sag * 0.35 * sagFactor;
        }

        if (!isDragging) {
          const lagFactor = Math.sin(t * Math.PI);
          pt.x -= lagFactor * (p.vel.x * 0.03);
        }

        spinePoints.push(pt);
      }

      // Build 4-vertex ribbon rings with thickness & normals
      for (let i = 0; i <= STRAP_SEGMENTS; i++) {
        const t = i / STRAP_SEGMENTS;
        const pt = spinePoints[i];

        // Curve tangent
        const tangent = new THREE.Vector3();
        if (i === 0) {
          tangent.subVectors(spinePoints[1], spinePoints[0]);
        } else if (i === STRAP_SEGMENTS) {
          tangent.subVectors(spinePoints[i], spinePoints[i - 1]);
        } else {
          tangent.subVectors(spinePoints[i + 1], spinePoints[i - 1]);
        }
        tangent.normalize();

        // Interpolated surface normal (twisting smoothly from ceiling to card)
        const surfNorm = new THREE.Vector3().lerpVectors(anchorNorm, cardNorm, t).normalize();

        // Lateral width vector
        const widthVec = new THREE.Vector3().crossVectors(tangent, surfNorm).normalize();
        widthVec.multiplyScalar(strapWidth * 0.5);

        // Thickness vector
        const thickVec = new THREE.Vector3().crossVectors(widthVec, tangent).normalize();
        thickVec.multiplyScalar(strapThick * 0.5);

        const vBase = i * 4 * 3;

        // 1. Front-Left
        posArr[vBase] = pt.x - widthVec.x + thickVec.x;
        posArr[vBase + 1] = pt.y - widthVec.y + thickVec.y;
        posArr[vBase + 2] = pt.z - widthVec.z + thickVec.z;
        normArr[vBase] = thickVec.x;
        normArr[vBase + 1] = thickVec.y;
        normArr[vBase + 2] = thickVec.z;

        // 2. Front-Right
        posArr[vBase + 3] = pt.x + widthVec.x + thickVec.x;
        posArr[vBase + 4] = pt.y + widthVec.y + thickVec.y;
        posArr[vBase + 5] = pt.z + widthVec.z + thickVec.z;
        normArr[vBase + 3] = thickVec.x;
        normArr[vBase + 4] = thickVec.y;
        normArr[vBase + 5] = thickVec.z;

        // 3. Back-Left
        posArr[vBase + 6] = pt.x - widthVec.x - thickVec.x;
        posArr[vBase + 7] = pt.y - widthVec.y - thickVec.y;
        posArr[vBase + 8] = pt.z - widthVec.z - thickVec.z;
        normArr[vBase + 6] = -thickVec.x;
        normArr[vBase + 7] = -thickVec.y;
        normArr[vBase + 8] = -thickVec.z;

        // 4. Back-Right
        posArr[vBase + 9] = pt.x + widthVec.x - thickVec.x;
        posArr[vBase + 10] = pt.y + widthVec.y - thickVec.y;
        posArr[vBase + 11] = pt.z + widthVec.z - thickVec.z;
        normArr[vBase + 9] = -thickVec.x;
        normArr[vBase + 10] = -thickVec.y;
        normArr[vBase + 11] = -thickVec.z;
      }

      posAttr.needsUpdate = true;
      normAttr.needsUpdate = true;
    }

    // ── Update Hardware Attachment Connector ─────────────────────────────
    if (claspGroupRef.current) {
      const claspPos = new THREE.Vector3(0, topClipOffset - 0.02, 0);
      claspPos.applyQuaternion(p.quaternion);
      claspPos.add(p.pos);
      claspGroupRef.current.position.copy(claspPos);
      claspGroupRef.current.quaternion.copy(p.quaternion);
    }
  });

  useEffect(() => {
    return () => {
      frontTexture.dispose();
      backTexture.dispose();
      strapTexture.dispose();
      strapGeometry.dispose();
    };
  }, [frontTexture, backTexture, strapTexture, strapGeometry]);

  return (
    <group>
      {/* ── Top Ceiling Anchor Bracket ── */}
      <mesh position={[anchorPos.x, anchorPos.y, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.14, 16]} />
        <meshStandardMaterial color="#1a1a20" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* ── Dynamic Flat Ribbon Fabric Lanyard Strap ── */}
      <mesh ref={strapMeshRef} geometry={strapGeometry}>
        <meshStandardMaterial
          map={strapTexture}
          color="#ffffff"
          roughness={0.82}
          metalness={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Realistic Hardware Attachment Connector ── */}
      <group ref={claspGroupRef}>
        {/* Ribbon Crimp Clamp (folded metal fitting securing strap end) */}
        <mesh position={[0, 0.11 * cardScale, 0]}>
          <boxGeometry
            args={[
              STRAP_WIDTH * cardScale * 1.05,
              0.12 * cardScale,
              0.04 * cardScale,
            ]}
          />
          <meshStandardMaterial color="#2c2c34" metalness={0.88} roughness={0.3} />
        </mesh>

        {/* Polished Chrome Swivel Barrel Joint */}
        <mesh position={[0, 0.03 * cardScale, 0]}>
          <cylinderGeometry
            args={[0.032 * cardScale, 0.032 * cardScale, 0.10 * cardScale, 16]}
          />
          <meshStandardMaterial color="#dcdce8" metalness={0.96} roughness={0.12} />
        </mesh>

        {/* Trigger Lobster Snap Hook / Ring passing through ID card punch hole */}
        <mesh position={[0, -0.05 * cardScale, 0]}>
          <torusGeometry args={[0.062 * cardScale, 0.016 * cardScale, 16, 24]} />
          <meshStandardMaterial color="#e0e0ea" metalness={0.96} roughness={0.12} />
        </mesh>

        {/* Clasp Spring Latch Detail */}
        <mesh position={[0.03 * cardScale, -0.05 * cardScale, 0]}>
          <cylinderGeometry
            args={[0.012 * cardScale, 0.012 * cardScale, 0.06 * cardScale, 12]}
          />
          <meshStandardMaterial color="#c0c0cc" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* ── 3D ID Card Group ── */}
      <group ref={cardGroupRef}>
        {/* Invisible slightly padded hit box for reliable pointer capture */}
        <mesh ref={hitMeshRef} visible={false}>
          <boxGeometry
            args={[cardDims.w * 1.25, cardDims.h * 1.25, 0.5]}
          />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Soft Drop Shadow Plane behind the card */}
        <mesh position={[0, -0.06, -0.06]}>
          <planeGeometry args={[cardDims.w * 1.05, cardDims.h * 1.05]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>

        {/* White Acrylic Badge Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[cardDims.w, cardDims.h, cardDims.d]} />
          <meshStandardMaterial
            color="#fcfcfd"
            roughness={0.25}
            metalness={0.05}
          />
        </mesh>

        {/* Subtle Outer Card Frame Rim */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry
            args={[
              cardDims.w + 0.02 * cardScale,
              cardDims.h + 0.02 * cardScale,
              cardDims.d * 0.9,
            ]}
          />
          <meshStandardMaterial
            color="#dcdce6"
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>

        {/* Top Punch Hole / Eyelet Sleeve */}
        <mesh position={[0, cardDims.h * 0.5 - 0.08 * cardScale, 0]}>
          <cylinderGeometry
            args={[0.08 * cardScale, 0.08 * cardScale, cardDims.d * 1.1, 16]}
          />
          <meshStandardMaterial color="#1a1a24" roughness={0.6} />
        </mesh>

        {/* Metallic Grommet Reinforcement Ring around Punch Hole */}
        <mesh position={[0, cardDims.h * 0.5 - 0.08 * cardScale, cardDims.d * 0.5 + 0.001]}>
          <ringGeometry args={[0.075 * cardScale, 0.11 * cardScale, 20]} />
          <meshStandardMaterial color="#d4d4de" metalness={0.92} roughness={0.2} />
        </mesh>

        {/* FRONT CARD FACE (Black-and-White Portrait & Typography) */}
        <mesh position={[0, 0, cardDims.d * 0.5 + 0.002]}>
          <planeGeometry
            args={[cardDims.w - 0.04 * cardScale, cardDims.h - 0.04 * cardScale]}
          />
          <meshStandardMaterial
            map={frontTexture}
            roughness={0.32}
            metalness={0.05}
          />
        </mesh>

        {/* BACK CARD FACE (Minimalist Details, Monogram & QR) */}
        <mesh
          position={[0, 0, -cardDims.d * 0.5 - 0.002]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry
            args={[cardDims.w - 0.04 * cardScale, cardDims.h - 0.04 * cardScale]}
          />
          <meshStandardMaterial
            map={backTexture}
            roughness={0.32}
            metalness={0.05}
          />
        </mesh>
      </group>
    </group>
  );
};
