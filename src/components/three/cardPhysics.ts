import * as THREE from 'three';

export const CARD_MASS = 1.35;
export const CARD_GRAVITY = 9.81;
export const CARD_FIXED_TIMESTEP = 1 / 240;
export const CARD_MAX_SUBSTEPS = 24;

// Release conditions matching Download.mp4:
// Fast downward fall with natural rightward bias, realistic tilt and momentum
export const CARD_RELEASE_VELOCITY = { x: 0.45, y: -5.8, z: 0 };
export const CARD_RELEASE_ANGULAR_VELOCITY = { x: 0.02, y: 0.0, z: 0.0 };
// Tilt ~25.2° counter-clockwise around Z (top points towards anchor, bottom leans right)
export const CARD_RELEASE_ROTATION = { x: 0.04, y: -0.06, z: 0.44 };

export interface CardBodyState {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  quaternion: THREE.Quaternion;
  angularVel: THREE.Vector3;
}

interface CardStepOptions {
  dt: number;
  dimensions: { w: number; h: number; d: number };
  anchor: THREE.Vector3;
  clipOffset: number;
  strapLength: number;
  falling: boolean;
  firstCatch: boolean;
  linearDamping: number;
  angularDamping: number;
  force: THREE.Vector3;
  torque: THREE.Vector3;
}

/**
 * Continuous physical simulation of the hanging ID card suspended on a fabric strap.
 * Simulates:
 * 1. Ballistic free-fall while strap is slack.
 * 2. Visibly arresting downward plunge when strap reaches taut length.
 * 3. Compound pendulum swing with natural rightward/leftward arc and torque around top clip.
 * 4. Subtle upward rebound arising from the circular pendulum constraint and strap elasticity.
 * 5. Natural settling with air/ribbon damping and user pointer dragging.
 */
export function stepCardBody(body: CardBodyState, options: CardStepOptions): boolean {
  const { dt, dimensions, anchor, clipOffset, strapLength } = options;

  // Diagonal inertia tensor in body frame for rectangular cuboid
  const inverseInertia = new THREE.Vector3(
    12 / (CARD_MASS * (dimensions.h ** 2 + dimensions.d ** 2)),
    12 / (CARD_MASS * (dimensions.w ** 2 + dimensions.d ** 2)),
    12 / (CARD_MASS * (dimensions.w ** 2 + dimensions.h ** 2))
  );

  const inverseRotation = body.quaternion.clone().invert();
  const applyInverseInertia = (vector: THREE.Vector3) =>
    vector
      .applyQuaternion(inverseRotation)
      .multiply(inverseInertia)
      .applyQuaternion(body.quaternion);

  // 1. External forces & Gravity
  body.vel.addScaledVector(options.force, dt / CARD_MASS);
  body.vel.y -= CARD_GRAVITY * dt;
  body.angularVel.addScaledVector(applyInverseInertia(options.torque.clone()), dt);

  // 2. Air damping
  body.vel.multiplyScalar(Math.exp(-options.linearDamping * dt));
  body.angularVel.multiplyScalar(Math.exp(-options.angularDamping * dt));

  // 3. Top suspension clip geometry (hardware attachment at top of card)
  const offset = new THREE.Vector3(0, clipOffset, 0).applyQuaternion(body.quaternion);
  const clipWorld = body.pos.clone().add(offset);
  const fromAnchor = clipWorld.clone().sub(anchor);
  const distance = fromAnchor.length();

  let caught = false;

  // The lanyard constraint is active below the ceiling anchor level when taut
  if (distance > 0.0001 && (!options.falling || fromAnchor.y <= 0)) {
    const normal = fromAnchor.divideScalar(distance);
    const lever = new THREE.Vector3().crossVectors(offset, normal);
    const angularResponse = applyInverseInertia(lever.clone());
    const inverseEffectiveMass = 1 / CARD_MASS + lever.dot(angularResponse);

    // Clip point velocity
    const clipVelocity = body.vel.clone().add(
      new THREE.Vector3().crossVectors(body.angularVel, offset)
    );
    const radialSpeed = clipVelocity.dot(normal);

    const isTaut = distance >= strapLength;

    if (isTaut) {
      // Ribbon torsional alignment: flat lanyard resists card twisting out of alignment with the strap
      const strapAngle = Math.atan2(fromAnchor.x, -fromAnchor.y);
      const cardEuler = new THREE.Euler().setFromQuaternion(body.quaternion, 'ZYX');
      const angleDiff = cardEuler.z - strapAngle;
      const ribbonTorque = -16.0 * angleDiff - 3.2 * body.angularVel.z;
      body.angularVel.z += (ribbonTorque / CARD_MASS) * dt * (12 / (dimensions.w ** 2 + dimensions.h ** 2));

      // First catch event: material restitution creates subtle upward recovery
      if (options.firstCatch && radialSpeed > 0) {
        caught = true;
        const restitution = 0.20; // 20% elastic rebound
        const targetSpeed = -restitution * radialSpeed;
        const impulse = (targetSpeed - radialSpeed) / inverseEffectiveMass;

        body.vel.addScaledVector(normal, impulse / CARD_MASS);
        body.angularVel.addScaledVector(angularResponse, impulse);

        const excess = distance - strapLength;
        if (excess > 0) {
          body.pos.addScaledVector(normal, -excess * 0.35);
        }
      } else if (radialSpeed > 0) {
        // Continuous bilateral constraint keeping strap length fixed while swinging
        const impulse = -radialSpeed / inverseEffectiveMass;
        body.vel.addScaledVector(normal, impulse / CARD_MASS);
        body.angularVel.addScaledVector(angularResponse, impulse);

        const excess = distance - strapLength;
        if (excess > 0) {
          body.pos.addScaledVector(normal, -excess * 0.35);
        }
      }
    }
  }

  // 4. Integrate velocity into position and orientation
  body.pos.addScaledVector(body.vel, dt);
  const angularSpeed = body.angularVel.length();
  if (angularSpeed > 0.00001) {
    const rotation = new THREE.Quaternion().setFromAxisAngle(
      body.angularVel.clone().divideScalar(angularSpeed),
      angularSpeed * dt
    );
    body.quaternion.premultiply(rotation).normalize();
  }

  return caught;
}
