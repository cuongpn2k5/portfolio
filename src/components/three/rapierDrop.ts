import * as THREE from 'three';
import type { RapierContext, RapierRigidBody } from '@react-three/rapier';
import { CARD_GRAVITY, CARD_MASS } from './cardPhysics.ts';
import type { CardBodyState } from './cardPhysics.ts';

type DropWorld = Pick<RapierContext, 'rapier' | 'world'>;

export function removeDropBody(context: DropWorld, body: RapierRigidBody): void {
  // Physics frees/resets its world before child effect cleanup in StrictMode.
  // Never ask a body backed by that freed WASM set for its collider list.
  // Identity also protects a new body that happens to reuse an old handle.
  if (context.world.getRigidBody(body.handle) === body) {
    context.world.removeRigidBody(body);
  }
}

export function createDropBody(
  context: DropWorld,
  state: CardBodyState,
  dimensions: { w: number; h: number; d: number }
): RapierRigidBody {
  const { w, h, d } = dimensions;
  return context.world.createRigidBody(context.rapier.RigidBodyDesc.dynamic()
    .setTranslation(state.pos.x, state.pos.y, state.pos.z)
    .setRotation(state.quaternion)
    .setLinvel(state.vel.x, state.vel.y, state.vel.z)
    .setAngvel(state.angularVel)
    .setAdditionalMassProperties(
      CARD_MASS, { x: 0, y: 0, z: 0 },
      { x: CARD_MASS * (h * h + d * d) / 12,
        y: CARD_MASS * (w * w + d * d) / 12,
        z: CARD_MASS * (w * w + h * h) / 12 },
      { x: 0, y: 0, z: 0, w: 1 }
    )
    .setLinearDamping(0.08)
    .setAngularDamping(0.35)
    .setCanSleep(false));
}

// Returns true just before the lanyard reaches its limit. The caller then
// continues the existing clip/drag solver with exactly these Rapier states.
export function advanceDrop(
  context: DropWorld,
  rigidBody: RapierRigidBody,
  state: CardBodyState,
  anchor: THREE.Vector3,
  clipOffset: number,
  strapLength: number,
  dt: number
): boolean {
  const offset = new THREE.Vector3(0, clipOffset, 0).applyQuaternion(state.quaternion);
  const fromAnchor = state.pos.clone().add(offset).sub(anchor);
  const distance = fromAnchor.length();
  const clipVelocity = state.vel.clone().add(
    new THREE.Vector3().crossVectors(state.angularVel, offset)
  );
  const outwardSpeed = distance > 0.0001 ? clipVelocity.dot(fromAnchor) / distance : 0;
  if (fromAnchor.y <= 0 && distance + outwardSpeed * dt + CARD_GRAVITY * dt * dt >= strapLength) {
    return true;
  }

  context.world.timestep = dt;
  rigidBody.resetForces(false);
  rigidBody.addForce({ x: 0, y: 0, z: -state.pos.z * 18 - state.vel.z * 5 }, false);
  context.world.step();
  const pos = rigidBody.translation();
  const rotation = rigidBody.rotation();
  const velocity = rigidBody.linvel();
  const angularVelocity = rigidBody.angvel();
  // Read the engine's output for rendering and the later momentum handoff.
  state.pos.set(pos.x, pos.y, pos.z);
  state.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  state.vel.set(velocity.x, velocity.y, velocity.z);
  state.angularVel.set(angularVelocity.x, angularVelocity.y, angularVelocity.z);
  return false;
}
