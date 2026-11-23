import React from 'react';
import {Person, Woodpecker} from './Cast';
import {BirdSketch, Chain, Chip, Coin, Nest, Pouch} from './World';
import {approach, bakerAt, carpenterAt, face, flight, guardAt, mayorAt, neighbourAt, recipient, turn, witnessAt} from './blocking';
import {BIRD_SEAT, CHAIN_SEAT, CHIP_FLOOR, DESK_POUCH, DESK_SKETCH, NEST, PECK, chipAt, mix, peckAt, point, shopDoorHandle, tween, type Point} from './story';

function upward(p: Point, y: number): Point {
  return [p[0], p[1] + y, p[2]];
}

function Bird({frame, sunset}: {frame: number; sunset: boolean}) {
  if (frame < 229) return null;
  if (frame < 247 || (frame >= 269 && frame < 518)) {
    const arriving = frame < 247;
    const f = arriving ? approach(frame) : flight(frame);
    const fold = arriving ? 1 - tween(frame, 237, 247) : tween(frame, 269, 276) * (1 - tween(frame, 510, 518));
    const wing = (.28 + .72 * (.5 + .5 * Math.sin(frame * 1.22))) * fold;
    const yaw = turn(-Math.PI / 2, f.yaw, arriving ? 1 - tween(frame, 238, 247) : tween(frame, 269, 278) * (1 - tween(frame, 509, 518)));
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

export function Performance({frame, sunset}: {frame: number; sunset: boolean}) {
  const mayor = mayorAt(frame);
  const witness = witnessAt(frame);
  const guard = guardAt(frame, 0);
  const guard2 = guardAt(frame, 1);
  const mayorWalk = tween(frame, 164, 177) * (1 - tween(frame, 211, 224))
    + .36 * tween(frame, 447, 454) * (1 - tween(frame, 486, 494));
  const counterTurn = tween(frame, 105, 120) * (1 - tween(frame, 137, 155));
  const order = tween(frame, 324, 337) * (1 - tween(frame, 350, 363));
  const mayorYaw = turn(.25, -.74, counterTurn);

  const drop = tween(frame, 13, 25);
  let pouch = upward(DESK_POUCH, .21 * (1 - drop));
  pouch[0] += .10 * (1 - drop);
  if (frame >= 154) {
    const carried: Point = [mayor[0] + .24, .92 + .028 * mayorWalk * Math.sin(frame * .6), mayor[2] + .23];
    pouch = point(pouch, carried, tween(frame, 154, 170));
  }

  const take = tween(frame, 803, 826);
  if (sunset) pouch = point(pouch, [recipient[0] - .29, .97, recipient[2] - .25], take);
  const recoil = tween(frame, 681, 703) * (1 - tween(frame, 778, 800));
  pouch[2] -= .12 * recoil;
  pouch[1] += .12 * recoil;

  const exchange: Point = [-4.33, 1.29, 1.88];
  const taxCoin = frame <= 130 ? point([-4.52, 1.25, 2.07], exchange, tween(frame, 113, 130))
    : point(exchange, upward(DESK_POUCH, .443), tween(frame, 130, 143));
  const taxArc = tween(frame, 130, 143);
  taxCoin[1] += .22 * Math.sin(Math.PI * taxArc);

  const extraCoin = point([mayor[0] - .24, 1.13, mayor[2] + .22], upward(pouch, .435), tween(frame, 298, 311));
  extraCoin[1] += .32 * Math.sin(Math.PI * tween(frame, 298, 311));
  const placeChain = tween(frame, 812, 832);
  const chain = point([mayor[0] - .13, 1.22, mayor[2] + .30], CHAIN_SEAT, placeChain);
  const chainTilt = 1.14 * (1 - placeChain);
  const chainGrip: Point = [chain[0] - .16, chain[1] + .04 + .09 * (1 - placeChain), chain[2]];
  const chip = chipAt(frame);
  const handChip: Point = [chip.position[0] + .14, chip.position[1] - .02, chip.position[2] + .03];

  let mayorHand: Point | undefined;
  let mayorOther: Point | undefined;
  if (frame < 15) mayorHand = upward(pouch, .37);
  else if (frame < 73) {
    const tap = point(upward(DESK_POUCH, .52), upward(DESK_SKETCH, .11), tween(frame, 15, 43));
    mayorHand = point(tap, [-3.29, 1.17, 1.43], tween(frame, 56, 73));
  } else if (frame >= 118 && frame < 146) {
    mayorHand = frame < 130 ? point([-4.13, 1.22, 1.52], exchange, tween(frame, 118, 130)) : taxCoin;
  } else if (frame >= 150 && (!sunset || frame < 821)) {
    mayorHand = upward(pouch, .37);
  }
  if (frame >= 293 && frame < 319) {
    mayorOther = point(extraCoin, [mayor[0] - .30, 1.03, mayor[2] + .17], tween(frame, 310, 319));
  } else if (order > 0) {
    mayorOther = point([mayor[0] - .27, .94, mayor[2] + .12], [mayor[0] + .64, 1.61, mayor[2] + .22], order);
  } else if (sunset && frame >= 808 && frame < 833) {
    mayorOther = chainGrip;
  }

  const bakerOut = tween(frame, 422, 462);
  const carpenterOut = tween(frame, 488, 559);
  const crouch = tween(frame, 556, 578) * (1 - tween(frame, 579, 600));
  const watchBird = tween(frame, 451, 469) * (1 - tween(frame, 486, 501));
  const witnessLook = turn(witness.yaw, face(witness.position, flight(frame).position), watchBird);
  const doorHand = frame >= 417 && frame < 432
    ? point(shopDoorHandle(Math.min(frame, 424)), [2.42, .91, -6.17], tween(frame, 424, 432)) : undefined;

  return <>
    <BirdSketch position={DESK_SKETCH} yaw={-.11} />
    <Pouch position={pouch} yaw={mix(-.14, .22, tween(frame, 154, 170))} />
    {frame >= 113 && frame < 144 && <Coin position={taxCoin} rotation={[.26, .48, frame * .08]} />}
    {frame >= 296 && frame < 312 && <Coin position={extraCoin} rotation={[.27, .32, frame * .08]} />}
    {frame > PECK && <Chip position={chip.position} rotation={chip.rotation} scale={.79} />}
    {sunset && frame >= 808 && <Chain position={chain} yaw={.27} tilt={chainTilt} />}
    <Person role="mayor" frame={frame} position={mayor} yaw={mayorYaw + .56 * mayorWalk + .44 * order + .39 * tween(frame, 447, 494)}
      step={(frame - 164) * .39} stride={mayorWalk * .8} expression={frame < 252 ? 'proud' : frame < 648 ? 'alert' : 'worried'}
      tilt={-.11 * recoil} hand={mayorHand} otherHand={mayorOther} chain={!sunset || frame < 808} />
    <Person role="guard" frame={frame} {...guard} expression={frame < 344 ? 'neutral' : 'alert'} tilt={.12 * guard.stride} />
    <Person role="guard" frame={frame} variant={1} {...guard2} expression={frame < 350 ? 'neutral' : 'alert'} tilt={.12 * guard2.stride} />
    <Person role="baker" frame={frame} position={bakerAt(frame)} yaw={mix(.14, .75, bakerOut)}
      step={frame * .44} stride={.62 * tween(frame, 422, 432) * (1 - tween(frame, 451, 462))} expression={frame < 427 ? 'neutral' : 'alert'} />
    {frame >= 442 && <Person role="villager" variant={4} frame={frame} position={point([1.36, 2.13, -5.71], [1.36, 2.42, -5.69], tween(frame, 442, 459))}
      yaw={-.32} scale={.36} tilt={-.14} expression="alert" />}
    <Person role="carpenter" frame={frame} position={carpenterAt(frame)} yaw={mix(.13, -.61, carpenterOut)} expression={frame < 650 ? 'focused' : 'amused'}
      step={frame * .49} stride={.9 * tween(frame, 488, 498) * (1 - tween(frame, 546, 559))}
      crouch={crouch} tilt={-.26 * crouch} hand={frame >= 558 ? (frame < 579 ? point([1.59, .96, .83], CHIP_FLOOR, tween(frame, 558, 579)) : handChip) : undefined} />
    {witness.visible && <Person role="villager" variant={2} frame={frame} position={witness.position} yaw={witnessLook} scale={.92}
      expression={frame < 149 ? 'focused' : frame < 432 ? 'neutral' : frame < 686 ? 'alert' : sunset ? 'amused' : 'worried'}
      tilt={-.11 * watchBird} lookUp={watchBird} otherHand={doorHand} step={frame * .42} stride={witness.stride} hand={frame >= 113 && frame <= 130 ? taxCoin
        : sunset && frame > 799 ? point([recipient[0] - .20, 1.10, recipient[2] + .15], upward(pouch, .34), tween(frame, 799, 815)) : undefined} />}
    {frame >= 456 && <Person role="villager" frame={frame} variant={3} position={neighbourAt(frame)} yaw={-.41} scale={.92}
      step={frame * .4} stride={.65 * tween(frame, 456, 466) * (1 - tween(frame, 495, 506))} expression="alert" />}
    <Bird frame={frame} sunset={sunset} />
  </>;
}
