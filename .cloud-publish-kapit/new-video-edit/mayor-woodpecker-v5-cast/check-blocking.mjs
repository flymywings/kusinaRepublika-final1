import {registerHooks} from 'node:module';

registerHooks({resolve(specifier, context, nextResolve) {
  try {
    return nextResolve(specifier, context);
  } catch (error) {
    if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error;
    return nextResolve(`${specifier}.ts`, context);
  }
}});
const {bakerAt, carpenterAt, guardAt, mayorAt, neighbourAt, witnessAt} = await import('./blocking.ts');
const {FRAMES, SHOP_HINGE, shopDoorYaw} = await import('./story.ts');

const staticSolids = [
  {name: 'bounty table', center: [-3.15, 2.15], size: [2.55, 1.05]},
  {name: 'plinth base', center: [0, 0], size: [1.94, 1.94 * .89]},
  {name: 'shop left wall', center: [1.0275, -7.30], size: [1.005, 2.92]},
  {name: 'shop right wall', center: [3.1725, -7.30], size: [1.005, 2.92]},
  {name: 'shop left jamb', center: [1.51, -5.795], size: [.095, .16]},
  {name: 'shop right jamb', center: [2.69, -5.795], size: [.095, .16]},
  {name: 'bounty awning left post', center: [-5.67, 1.07], size: [.092, .092]},
  {name: 'bounty awning right post', center: [-4.22, 1.07], size: [.092, .092]},
];

const stallYaw = -.40;
const worldStall = (x, z) => [5.31 + Math.cos(stallYaw) * x + Math.sin(stallYaw) * z,
  -.46 - Math.sin(stallYaw) * x + Math.cos(stallYaw) * z];
staticSolids.push({name: 'market counter', center: worldStall(0, .05), size: [2.08, .90], yaw: stallYaw});
for (const x of [-1.02, 1.02]) for (const z of [.53, -.52]) {
  staticSolids.push({name: `market post ${x},${z}`, center: worldStall(x, z), size: [.105, .105], yaw: stallYaw});
}

function clearance(position, {center, size, yaw = 0}) {
  const dx = position[0] - center[0];
  const dz = position[2] - center[1];
  const x = Math.cos(yaw) * dx - Math.sin(yaw) * dz;
  const z = Math.sin(yaw) * dx + Math.cos(yaw) * dz;
  return Math.hypot(Math.max(0, Math.abs(x) - size[0] / 2), Math.max(0, Math.abs(z) - size[1] / 2));
}

const closest = new Map();
const failures = [];
for (let frame = 0; frame < FRAMES; frame++) {
  const witness = witnessAt(frame);
  const actors = [
    ['mayor', mayorAt(frame), .245], ['guard blue', guardAt(frame, 0).position, .245],
    ['guard violet', guardAt(frame, 1).position, .245], ['baker', bakerAt(frame), .245],
    ['carpenter', carpenterAt(frame), .245],
    ...(witness.visible ? [['taxpayer', witness.position, .226]] : []),
    ...(frame >= 456 ? [['neighbour', neighbourAt(frame), .226]] : []),
  ];
  const doorYaw = shopDoorYaw(frame);
  const door = {name: 'swinging shop door', center: [SHOP_HINGE[0] + .532 * Math.cos(doorYaw), SHOP_HINGE[2] - .532 * Math.sin(doorYaw)], size: [1.067, .118], yaw: doorYaw};
  for (const [actor, position, radius] of actors) for (const solid of [...staticSolids, door]) {
    const gap = clearance(position, solid) - radius;
    const record = {actor, obstacle: solid.name, frame, gap: +gap.toFixed(3), x: +position[0].toFixed(3), z: +position[2].toFixed(3)};
    if (gap < (closest.get(actor)?.gap ?? Infinity)) closest.set(actor, record);
    if (gap < -1e-6) failures.push(record);
  }
  for (let i = 0; i < actors.length; i++) for (let j = i + 1; j < actors.length; j++) {
    const [actor, position, radius] = actors[i];
    const [other, target, otherRadius] = actors[j];
    const gap = Math.hypot(position[0] - target[0], position[2] - target[2]) - radius - otherRadius;
    if (gap < -1e-6) failures.push({actor, obstacle: other, frame, gap: +gap.toFixed(3), x: +position[0].toFixed(3), z: +position[2].toFixed(3)});
  }
}
console.table([...closest.values()]);
if (failures.length) {
  console.table(failures.slice(0, 16));
  throw new Error(`${failures.length} padded body/solid intersections across ${FRAMES} frames`);
}
console.log(`PASS ${FRAMES} frames of padded actor/actor and actor/solid clearance (intentional hand contacts excluded).`);
