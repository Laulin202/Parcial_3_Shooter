import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import {WeaponModel} from "./WeaponModel.jsx";
import {useEffect, useRef, useState} from "react";
import {useFrame} from "@react-three/fiber";


const recoilAmount = 0.03;
const recoilDuration = 100;
const easing = TWEEN.Easing.Quadratic.Out;

export const Weapon = (props) => {

    
    return (
        <group {...props}>
            <WeaponModel />
        </group>
    );
}