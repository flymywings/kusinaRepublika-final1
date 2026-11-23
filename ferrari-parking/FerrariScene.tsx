import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BankSet } from './BankSet';
import { VaultSet } from './VaultSet';
import { StreetSet } from './StreetSet';
import { FerrariModel } from './FerrariModel';
import {
  CharacterCardMesh,
  drawBillionaire,
  drawBanker,
  drawGuard,
} from './FerrariActors';
import { Lighting } from './Lighting';
import { getStoryState, CameraState } from './story';

function CameraController({ cameraState }: { cameraState: CameraState }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...cameraState.pos);
    camera.lookAt(new THREE.Vector3(...cameraState.look));
    const persp = camera as THREE.PerspectiveCamera;
    if (persp.isPerspectiveCamera && persp.fov !== cameraState.fov) {
      persp.fov = cameraState.fov;
      persp.updateProjectionMatrix();
    }
  }, [camera, cameraState]);

  return null;
}

export function FerrariScene({ frame }: { frame: number }) {
  const state = getStoryState(frame);

  return (
    <>
      <CameraController cameraState={state.camera} />
      <Lighting lighting={state.lighting} />

      {/* Active 3D Environment */}
      {state.activeScene === 'bank' && <BankSet />}
      {state.activeScene === 'vault' && <VaultSet liftY={state.liftY} />}
      {state.activeScene === 'street' && <StreetSet />}

      {/* Ferrari Supercar */}
      {state.car.visible && (
        <FerrariModel position={state.car.pos} rotation={state.car.rot} />
      )}

      {/* 2D Toon Character Cards */}
      {state.billionaire.visible && (
        <CharacterCardMesh
          draw={(pen) => drawBillionaire(pen, state.billionaire.action)}
          position={state.billionaire.pos}
          rotationY={state.billionaire.rotY}
        />
      )}

      {state.banker.visible && (
        <CharacterCardMesh
          draw={(pen) => drawBanker(pen, state.banker.action)}
          position={state.banker.pos}
          rotationY={state.banker.rotY}
        />
      )}

      {state.guard.visible && (
        <CharacterCardMesh
          draw={(pen) => drawGuard(pen)}
          position={state.guard.pos}
          rotationY={state.guard.rotY}
        />
      )}
    </>
  );
}
