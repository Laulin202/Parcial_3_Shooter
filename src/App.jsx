import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import * as TWEEN from "@tweenjs/tween.js";
import { PointerLockControls, Sky } from "@react-three/drei";
import { Ground } from "./components/Ground.jsx";
import { Physics, RigidBody } from '@react-three/rapier';
import { Player } from "./components/Player.jsx";
import { Cubes } from './components/Cubes.jsx';
import {create} from "zustand"

import { useFrame } from "@react-three/fiber";

import './App.css'

const shadowOffset = 50;

export const usePointerLockControlsStore = create(()=>({
  isLock: false,
}))

function App() {

  const PointerLockControlsLockHandler = () => {
    usePointerLockControlsStore.setState({isLock: true});
  }

  const PointerLockControlsUnlockHandler = () =>{
    usePointerLockControlsStore.setState({isLock: false});
  }

  return (
    <>
      <PointerLockControls onLock={PointerLockControlsLockHandler} onUnlock={PointerLockControlsUnlockHandler} />
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={1.5} />
      <directionalLight
        castShadow
        intensity={1.5}
        shadow-mapSize={4096}
        shadow-camera-top={shadowOffset}
        shadow-camera-bottom={-shadowOffset}
        shadow-camera-left={shadowOffset}
        shadow-camera-right={-shadowOffset}
        position={[100, 100, 0]} />

      <Physics gravity={[0, -20, 0]}>
        <Ground />
        <Player />
        <Cubes />
      </Physics>

    </>
  )
}

export default App
