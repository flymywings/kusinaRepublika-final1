import React from 'react';
import { CatmullRomCurve3, Vector3 } from 'three';
import { Person, Woodpecker } from './Cast';
import { BirdSketch, Chain, Chip, Coin, Nest, Pouch } from './World';
import { BIRD_SEAT, CHAIN_SEAT, CHIP_FLOOR, DESK_POUCH, DESK_SKETCH, NEST, PECK, chipAt, limit, mix, peckAt, point, tween, type Point } from './story';

type RouteKey = readonly [frame: number, position: Point];

function route(keys: RouteKey[]) {
  const curve = new CatmullRomCurve3(keys.map(([, p]) => new Vector3(...p)), false, 'centripetal');
  return (frame: number): { position: Point; yaw: number; rise: number } => {
    const i = Math.max(0, Math.min(keys.length - 2, keys.findLastIndex(([f]) => f <= frame)));
    const t = limit((frame - keys[i][0]) / (keys[i + 1][0] - keys[i][0]));
    const u = (i + t) / (keys.length - 1);
    const p = curve.getPoint(u);
    const direction = curve.getTangent(u);
    return { position: [p.x, p.y, p.z], yaw: Math.atan2(direction.x, direction.z), rise: direction.y };
  };
}

const flight = route([[269, BIRD_SEAT], [293, [1.7, 3.52, .85]], [327, [-1.3, 2.30, 2.50]],
  [362, [-2.0, 1.84, 2.0]], [385, [-.55, 1.82, 2.65]], [406, [1.32, 2.20, 2.48]],
  [440, [2.94, 2.38, 1.40]], [467, [2.77, 2.30, -.82]], [490, [2.23, 2.60, -1.24]],
  [510, [1.25, 3.40, .45]], [518, BIRD_SEAT]]);

const guardRoute = route([[344, [-2.15, 0, 1.27]], [366, [-1.75, 0, 2.05]], [393, [.02, 0, 2.77]],
  [415, [1.66, 0, 2.52]], [441, [2.56, 0, 1.76]], [465, [2.65, 0, .18]], [484, [2.48, 0, -.71]]]);

const mayorDesk: Point = [-3.67, 0, 1.30];
const mayorStatue: Point = [-.78, 0, 1.19];
const recipient: Point = [.46, 0, 1.85];
const waitAt: Point = [2.21, 0, 1.54];
const recipientRoute = route([[435, [2.16, 0, -5.64]], [495, [1.92, 0, -2.68]],
  [550, [2.26, 0, -.85]], [611, waitAt]]);

function upward(p: Point, y: number): Point { return [p[0], p[1] + y, p[2]]; }

function turn(a: number, b: number, t: number) {
  const delta = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + delta * t;
}

function Bird({ frame, sunset }: { frame: number; sunset: boolean }) {
  if (frame >= 269 && frame < 518) {
    const f = flight(frame);
    const fold = tween(frame, 269, 276) * (1 - tween(frame, 510, 518));
    const wing = (.28 + .72 * (.5 + .5 * Math.sin(frame * 1.22))) * fold;
    const yaw = turn(-Math.PI / 2, f.yaw, tween(frame, 269, 278) * (1 - tween(frame, 509, 518)));
    return <Woodpecker position={f.position} yaw={yaw} pitch={f.rise * .23 * fold} wing={wing} />;
  }
  if (sunset) {
    const seat: Point = [-.045, 4.005, .07];
    const climb = tween(frame, 802, 824);
    const position = point(BIRD_SEAT, seat, climb);
    position[1] += .31 * Math.sin(Math.PI * climb);
    return <><Woodpecker position={position} yaw={mix(-Math.PI / 2, -.48, climb)} wing={Math.sin(Math.PI * climb) * .64} peck={.17 * tween(frame, 874, 882)} />
      <Nest position={NEST} /></>;
  }
  return <Woodpecker position={BIRD_SEAT} yaw={-Math.PI / 2} peck={peckAt(frame)} />;
}

export function Performance({ frame, sunset }: { frame: number; sunset: boolean }) {
  const mayorProgress = tween(frame, 351, 433);
  const mayor = point(mayorDesk, mayorStatue, mayorProgress);
  const mayorWalk = tween(frame, 351, 363) * (1 - tween(frame, 419, 433));
  const mayorYaw = mix(.25, .64, mayorProgress) + .48 * mayorWalk;

  const drop = tween(frame, 13, 25);
  let pouch = upward(DESK_POUCH, .21 * (1 - drop));
  pouch[0] += .10 * (1 - drop);
  if (frame >= 343) {
    const carried: Point = [mayor[0] + .24, .92 + .03 * mayorWalk * Math.sin(frame * .6), mayor[2] + .23];
    pouch = point(DESK_POUCH, carried, tween(frame, 343, 353));
  }
  const take = tween(frame, 803, 826);
  if (sunset) pouch = point(pouch, [recipient[0] - .29, .97, recipient[2] - .25], take);

  let mayorHand: Point | undefined;
  if (frame < 15) mayorHand = upward(pouch, .37);
  else if (frame < 73) {
    const tap = point(upward(DESK_POUCH, .52), upward(DESK_SKETCH, .11), tween(frame, 15, 43));
    mayorHand = point(tap, [-3.29, 1.17, 1.43], tween(frame, 56, 73));
  } else if (frame >= 289 && frame < 324) {
    mayorHand = point([-3.06, 1.54, 1.61], upward(DESK_POUCH, .40), tween(frame, 294, 309));
  } else if (frame >= 329 && frame < 348) {
    mayorHand = point([-2.80, 1.79, 1.46], upward(pouch, .36), tween(frame, 336, 348));
  } else if (frame >= 348 && (!sunset || frame < 821)) {
    mayorHand = upward(pouch, .37);
  }
  const recoil = tween(frame, 681, 703);
  if (frame >= 649 && frame <= 750) {
    pouch[2] -= .12 * recoil;
    pouch[1] += .12 * recoil;
    mayorHand = upward(pouch, .37);
  }

  const buyerStep = tween(frame, 105, 124);
  const buyer = point([-4.66, 0, 1.92], [-4.12, 0, 2.02], buyerStep);
  const taxCoin = point([-3.83, 1.64, 2.18], [-3.34, 1.34, 2.09], tween(frame, 124, 142));
  const extraCoin = point([-3.05, 1.55, 1.70], [-3.35, 1.34, 2.08], tween(frame, 298, 311));
  const chain = point([mayor[0] - .14, 1.31, mayor[2] + .15], CHAIN_SEAT, tween(frame, 809, 832));
  const chip = chipAt(frame);
  const handChip: Point = [chip.position[0] + .14, chip.position[1] - .02, chip.position[2] + .03];

  const guard = guardRoute(frame);
  const guard2 = guardRoute(frame - 13);
  const pace = (f: number) => tween(f, 344, 360) * (1 - tween(f, 465, 484));
  const guardYaw = (f: number, yaw: number) => f < 344 ? -.84 : f > 482 ? yaw + 2.55 * tween(f, 482, 514) : yaw;
  const bakerOut = tween(frame, 422, 462);
  const shopOut = tween(frame, 435, 474);
  const carpenterOut = tween(frame, 488, 559);
  const carpenter = point([1.86, 0, -2.70], [1.66, 0, .63], carpenterOut);
  const crouch = tween(frame, 556, 578) * (1 - tween(frame, 579, 600));
  const villager = recipientRoute(frame);
  const stepIn = tween(frame, 648, 674);
  const readChip = tween(frame, 667, 676) * (1 - tween(frame, 680, 693));
  const enterTurn = tween(frame, 647, 655) * (1 - tween(frame, 664, 676));
  const villagerYaw = turn(villager.yaw, -.67 - .68 * enterTurn, 1 - tween(frame, 434, 446) * (1 - tween(frame, 603, 612)));
  const villagerStride = .58 * tween(frame, 435, 450) * (1 - tween(frame, 601, 611))
    + .85 * tween(frame, 648, 654) * (1 - tween(frame, 666, 675));

  return <>
    <BirdSketch position={DESK_SKETCH} yaw={-.11} />
    <Pouch position={pouch} yaw={frame >= 343 ? .22 : -.14} />
    {frame >= 116 && frame < 144 && <Coin position={taxCoin} rotation={[.26, .48, frame * .08]} />}
    {frame >= 294 && frame < 312 && <Coin position={extraCoin} rotation={[.27, .32, frame * .08]} />}
    {frame > PECK && <Chip position={chip.position} rotation={chip.rotation} scale={.79} />}
    {sunset && frame >= 808 && <Chain position={chain} yaw={.27} />}
    <Person role="mayor" frame={frame} position={mayor} yaw={mayorYaw} step={(frame - 351) * .39} stride={mayorWalk * .8}
      expression={frame < 252 ? 'proud' : frame < 648 ? 'alert' : 'worried'} tilt={-.11 * recoil}
      hand={mayorHand} otherHand={sunset && frame >= 808 && frame < 833 ? upward(chain, .04) : undefined}
      chain={!sunset || frame < 808} />
    <Person role="villager" variant={2} frame={frame} position={buyer} yaw={.97} scale={.92} expression="focused"
      step={frame * .36} stride={.65 * tween(frame, 102, 108) * (1 - tween(frame, 119, 127))}
      hand={frame >= 112 && frame < 147 ? taxCoin : undefined} />
    <Person role="guard" frame={frame} position={guard.position} yaw={guardYaw(frame, guard.yaw)} step={(frame - 344) * .53} stride={pace(frame)}
      expression={frame < 344 ? 'neutral' : 'alert'} tilt={.12 * pace(frame)} />
    <Person role="guard" frame={frame} variant={1} position={[guard2.position[0] - .66, 0, guard2.position[2] - .28]}
      yaw={guardYaw(frame - 13, guard2.yaw)} step={(frame - 357) * .53 + .7} stride={pace(frame - 13)} expression={frame < 357 ? 'neutral' : 'alert'} />
    <Person role="baker" frame={frame} position={point([-2.9, 0, -5.78], [-2.45, 0, -3.15], bakerOut)} yaw={mix(.14, .75, bakerOut)}
      step={frame * .44} stride={.62 * tween(frame, 422, 432) * (1 - tween(frame, 451, 462))} expression={frame < 427 ? 'neutral' : 'alert'} />
    {frame >= 442 && <Person role="villager" variant={4} frame={frame} position={point([1.36, 2.13, -5.71], [1.36, 2.42, -5.69], tween(frame, 442, 459))}
      yaw={-.32} scale={.36} tilt={-.14} expression="alert" />}
    <Person role="carpenter" frame={frame} position={carpenter} yaw={mix(.13, -.61, carpenterOut)} expression={frame < 650 ? 'focused' : 'amused'}
      step={frame * .49} stride={.9 * tween(frame, 488, 498) * (1 - tween(frame, 546, 559))}
      crouch={crouch} tilt={-.26 * crouch} hand={frame >= 558 ? (frame < 579 ? point([1.59, .96, .83], CHIP_FLOOR, tween(frame, 558, 579)) : handChip) : undefined} />
    <Person role="villager" frame={frame} variant={1} position={frame <= 648 ? villager.position : point(waitAt, recipient, stepIn)}
      yaw={turn(villagerYaw, .74, readChip)}
      expression={frame < 442 ? 'neutral' : frame < 686 ? 'alert' : sunset ? 'amused' : 'worried'} step={frame * .42}
      stride={villagerStride}
      hand={sunset && frame > 799 ? point([recipient[0] - .20, 1.10, recipient[2] + .15], upward(pouch, .34), tween(frame, 799, 815)) : undefined} />
    <Person role="villager" frame={frame} variant={3} position={point([3.18, 0, -5.76], [2.57, 0, -3.23], shopOut)} yaw={-.41} scale={.92}
      step={frame * .4} stride={.66 * tween(frame, 435, 444) * (1 - tween(frame, 462, 474))} expression={frame < 442 ? 'neutral' : 'alert'} />
    <Bird frame={frame} sunset={sunset} />
  </>;
}
