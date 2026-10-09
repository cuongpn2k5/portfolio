import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import * as THREE from 'three';
import {
  CARD_RELEASE_VELOCITY, CARD_RELEASE_ANGULAR_VELOCITY, CARD_RELEASE_ROTATION, stepCardBody,
  CARD_FIXED_TIMESTEP, CARD_MAX_SUBSTEPS,
} from '../src/components/three/cardPhysics.ts';
import { createDropBody, advanceDrop, removeDropBody } from '../src/components/three/rapierDrop.ts';

// Resolve the same Rapier version supplied by @react-three/rapier in the app.
const requireRapier = createRequire(import.meta.resolve('@react-three/rapier'));
const rapier = requireRapier('@dimforge/rapier3d-compat');
await rapier.init();

const dt = CARD_FIXED_TIMESTEP;

function simulate(scale, strapLength, frameRate = 60, previousRelease = false) {
  const dimensions = { w: 1.7 * scale, h: 2.55 * scale, d: 0.04 * scale };
  const anchor = new THREE.Vector3(2, 3, 0);
  const clipOffset = dimensions.h * 0.5 + 0.08 * scale;
  const restingY = anchor.y - strapLength - clipOffset;
  const body = {
    pos: new THREE.Vector3(anchor.x - 0.04, anchor.y + dimensions.h * 0.5 + 0.12, 0),
    vel: new THREE.Vector3(
      previousRelease ? 0.55 : CARD_RELEASE_VELOCITY.x,
      previousRelease ? -1.2 : CARD_RELEASE_VELOCITY.y, 0
    ),
    quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(
      CARD_RELEASE_ROTATION.x, CARD_RELEASE_ROTATION.y, CARD_RELEASE_ROTATION.z
    )),
    angularVel: new THREE.Vector3(
      CARD_RELEASE_ANGULAR_VELOCITY.x, CARD_RELEASE_ANGULAR_VELOCITY.y, CARD_RELEASE_ANGULAR_VELOCITY.z
    ),
  };
  const world = new rapier.World({ x: 0, y: -9.81, z: 0 });
  const context = { world, rapier };
  let dropBody = previousRelease ? null : createDropBody(context, body, dimensions);
  let catchTime = null;
  let accumulator = 0;
  let time = 0;
  const samples = [];
  for (let frame = 0; frame < frameRate * 7; frame++) {
    accumulator = Math.min(accumulator + Math.min(1 / frameRate, dt * CARD_MAX_SUBSTEPS), dt * CARD_MAX_SUBSTEPS);
    while (accumulator >= dt - 1e-10) {
      const falling = catchTime === null;
      const force = new THREE.Vector3(0, 0, -body.pos.z * 18 - body.vel.z * 5);
      let steppedDrop = false;
      if (dropBody) {
        if (advanceDrop(context, dropBody, body, anchor, clipOffset, strapLength, dt)) {
          world.removeRigidBody(dropBody);
          dropBody = null;
        } else {
          steppedDrop = true;
        }
      }
      const caught = !steppedDrop && stepCardBody(body, {
        dt, dimensions, anchor, clipOffset, strapLength,
        falling, firstCatch: falling,
        linearDamping: falling ? 0.08 : 1.8,
        angularDamping: falling ? 0.35 : 1.7,
        force, torque: new THREE.Vector3(),
      });
      time += dt;
      accumulator -= dt;
      if (caught) catchTime = time;
      const clip = new THREE.Vector3(0, clipOffset, 0).applyQuaternion(body.quaternion).add(body.pos);
      samples.push({
        time, x: body.pos.x - anchor.x, y: body.pos.y,
        vy: body.vel.y, speed: body.vel.length(),
        angularSpeed: body.angularVel.length(),
        distance: clip.distanceTo(anchor),
        clipBelow: clip.y <= anchor.y,
        rotation: body.quaternion.clone(),
      });
    }
  }
  world.free();
  return { samples, catchTime, dimensions, restingY, strapLength, body };
}

for (const [name, scale, length] of [['desktop', 1.15, 2.55], ['mobile', 0.828, 1.85]]) {
  test(`${name}: gravity, finite motion, bounded catch and rebound, damped swing`, () => {
    const result = simulate(scale, length);
    const { samples, catchTime, dimensions } = result;
    assert.ok(catchTime >= 0.45 - 1e-9 && catchTime <= 0.65 + 1e-9, `catch at ${catchTime}`);
    const previous = simulate(scale, length, 60, true);
    const durationReduction = 1 - catchTime / previous.catchTime;
    assert.ok(durationReduction >= 0.4 && durationReduction <= 0.5,
      `duration reduction ${durationReduction}`);
    const fall = samples.filter(s => s.time < catchTime - 0.03);
    assert.ok(fall.at(-1).vy < fall[0].vy - 3, 'gravity must accelerate the fall');
    assert.ok(fall.at(-1).x > fall[0].x + 0.25, 'small rightward momentum must survive free fall');
    const after = samples.filter(s => s.time >= catchTime);
    assert.ok(samples.every(s => Number.isFinite(s.y + s.speed + s.angularSpeed)));
    const extension = Math.max(...samples.filter(s => s.clipBelow).map(s => s.distance - length));
    assert.ok(extension < 0.015, `strap extension ${extension}`);
    const first = after[0];
    const apex = after.filter(s => s.time < catchTime + 0.5).reduce((a, b) => b.y > a.y ? b : a);
    const reboundRatio = (apex.y - first.y) / dimensions.h;
    assert.ok(reboundRatio >= 0.025 && reboundRatio <= 0.075, `rebound ratio ${reboundRatio}`);
    const right = Math.max(...after.filter(s => s.time < catchTime + 1.2).map(s => s.x));
    const left = Math.min(...after.filter(s => s.time > catchTime + 0.8).map(s => s.x));
    assert.ok(right > 0.2 && left < -0.025, `swing right ${right}, left ${left}`);
    const settled = after.find(s => s.time >= catchTime + 2.5);
    assert.ok(Math.abs(settled.x) < 0.1 && settled.speed < 0.35, `settling x ${settled.x}, speed ${settled.speed}`);
    for (let i = 1; i < samples.length; i++) {
      assert.ok(Math.abs(samples[i].y - samples[i - 1].y) < 0.06, 'no position discontinuity');
      assert.ok(samples[i].rotation.angleTo(samples[i - 1].rotation) < 0.06, 'no rotation discontinuity');
    }
    console.log(`${name}: catch=${catchTime.toFixed(3)}s faster=${(durationReduction * 100).toFixed(1)}% rebound=${(reboundRatio * 100).toFixed(2)}% max-extension=${extension.toFixed(5)} settled-speed=${settled.speed.toFixed(3)}`);
  });
}

test('fixed-step motion agrees at 12, 30, 60 and 120 render frames per second', () => {
  const baseline = simulate(1.15, 2.55, 60);
  for (const rate of [12, 30, 120]) {
    const result = simulate(1.15, 2.55, rate);
    assert.ok(Math.abs(result.catchTime - baseline.catchTime) < dt);
    assert.ok(result.body.pos.distanceTo(baseline.body.pos) < 0.002);
    assert.ok(result.body.quaternion.angleTo(baseline.body.quaternion) < 0.002);
  }
});

test('off-center drag adds torque and release retains momentum', () => {
  const result = simulate(1.15, 2.55);
  const { body, dimensions, strapLength } = result;
  const anchor = new THREE.Vector3(2, 3, 0);
  const offset = new THREE.Vector3(0.6, -0.7, 0).applyQuaternion(body.quaternion);
  const force = new THREE.Vector3(35, 8, 0);
  const options = {
    dt, dimensions, anchor, clipOffset: dimensions.h * 0.5 + 0.08 * 1.15,
    strapLength, falling: false, firstCatch: false,
    linearDamping: 0.85, angularDamping: 2.1,
    force, torque: new THREE.Vector3().crossVectors(offset, force),
  };
  for (let i = 0; i < 30; i++) stepCardBody(body, options);
  assert.ok(body.angularVel.length() > 0.1);
  const before = body.vel.clone();
  stepCardBody(body, { ...options, force: new THREE.Vector3(), torque: new THREE.Vector3() });
  assert.ok(body.vel.length() > 0.1);
  assert.ok(body.vel.distanceTo(before) < 0.1, 'release must not reset velocity');
});

test('Rapier body recreation preserves state and cleanup leaves no duplicate bodies', () => {
  const { body: state, dimensions } = simulate(1.15, 2.55);
  const world = new rapier.World({ x: 0, y: -9.81, z: 0 });
  const context = { world, rapier };
  state.vel.set(0.75, -7.2, 0);
  for (let replay = 0; replay < 3; replay++) {
    const body = createDropBody(context, state, dimensions);
    assert.equal(world.bodies.len(), 1);
    const position = body.translation();
    const velocity = body.linvel();
    const rotation = body.rotation();
    assert.ok(new THREE.Vector3(position.x, position.y, position.z).distanceTo(state.pos) < 1e-6);
    assert.ok(new THREE.Vector3(velocity.x, velocity.y, velocity.z).distanceTo(state.vel) < 1e-6);
    assert.ok(new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
      .normalize().angleTo(state.quaternion) < 1e-5);
    removeDropBody(context, body);
    assert.equal(world.bodies.len(), 0);
  }
  world.free();
});

test('cleanup skips a freed world body and protects recycled handles in the new world', () => {
  const { body: state, dimensions } = simulate(1.15, 2.55);
  let currentWorld = new rapier.World({ x: 0, y: -9.81, z: 0 });
  const context = { rapier, get world() { return currentWorld; } };
  const oldBody = createDropBody(context, state, dimensions);
  currentWorld.free();
  currentWorld = new rapier.World({ x: 0, y: -9.81, z: 0 });
  assert.doesNotThrow(() => removeDropBody(context, oldBody));
  const replacement = createDropBody(context, state, dimensions);
  assert.doesNotThrow(() => removeDropBody(context, oldBody));
  assert.equal(currentWorld.bodies.len(), 1, 'stale cleanup must preserve the replacement');
  removeDropBody(context, replacement);
  assert.equal(currentWorld.bodies.len(), 0);
  currentWorld.free();
});
