import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat"
import * as TWEEN from "@tweenjs/tween.js";
import { CapsuleCollider, RigidBody, useRapier } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { usePersonControls } from "../hooks.js";
import { useFrame } from "@react-three/fiber";
import { useAimStore, Weapon } from "./Weapon.jsx";



const MOVE_SPEED = 5;
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

const rotation = new THREE.Vector3();

const swayingGroup = new TWEEN.Group();

export const Player = () => {

    const playerRef = useRef();
    const { forward, backward, left, right, jump } = usePersonControls();
    const objectInHandRef = useRef();

    // Aiming
    const isAiming = useAimStore((state) => state.isAiming);


    //Weapon animation 
    const swayingObjectRef = useRef();
    const [swayingAnimation, setSwayingAnimation] = useState(null);
    const [swayingBackAnimation, setSwayingBackAnimation] = useState(null);
    const [isSwayingAnimationFinished, setIsSwayingAnimationFinished] = useState(true);

    // Aiming animation
    const [aimingAnimation, setAimingAnimation] = useState(null);
    const [aimingBackAnimation, setAimingBackAnimation] = useState(null);



    const rapier = useRapier();

    useFrame((state) => {
        if (!playerRef.current) return;

        //Moving Player
        const velocity = playerRef.current.linvel();

        frontVector.set(0, 0, backward - forward);
        sideVector.set(left - right, 0, 0);
        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(MOVE_SPEED).applyEuler(state.camera.rotation);
        playerRef.current.wakeUp();
        playerRef.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z });

        //JUMPING TEST
        const world = rapier.world;
        const playerPosition = {
            x: playerRef.current.translation().x,
            y: playerRef.current.translation().y - 0.5,
            z: playerRef.current.translation().z
        }
        const ray = world.castRay(new RAPIER.Ray(playerPosition, { x: 0, y: -1, z: 0 }));
        const grounded = ray && ray.collider && ray.timeOfImpact <= 1;


        if (jump && grounded) doJump();

        //MOVING CAMERA

        const { x, y, z } = playerRef.current.translation();
        state.camera.position.set(x, y, z);

        //MOVING OBJECT IN HAND FOR THE PLAYER

        objectInHandRef.current.rotation.copy(state.camera.rotation);
        objectInHandRef.current.position.copy(state.camera.position).add(state.camera.getWorldDirection(rotation));


        // WEAPON ANIMATION (Doesn´t Work)
        //VERIFY PLAYER MOVEMENT

        const isMoving = direction.length() > 0;
        if (isMoving && isSwayingAnimationFinished) {
            setIsSwayingAnimationFinished(false);
            swayingAnimation.start();
        }

        swayingGroup.update()

    });

    //FUNCION SALTAR
    const doJump = () => {
        playerRef.current.setLinvel({ x: 0, y: 8, z: 0 });
    }

    //FUNCION ANIMACION ARMA
    const initSwayingObjectAnimation = () => {
        const currentPosition = new THREE.Vector3(0, 0, 0);
        const initialPosition = new THREE.Vector3(0, 0, 0);
        const newPosition = new THREE.Vector3(-0.02, 0.01, 0);
        const animationDuration = 300;
        const easing = TWEEN.Easing.Quadratic.Out;
        const twSwayingAnimation = new TWEEN.Tween(currentPosition, swayingGroup)
            .to(newPosition, animationDuration)
            .easing(easing)
            .onUpdate(() => {
                swayingObjectRef.current.position.copy(currentPosition);
            });
        const twSwayingBackAnimation = new TWEEN.Tween(currentPosition, swayingGroup)
            .to(initialPosition, animationDuration)
            .easing(easing)
            .onUpdate(() => {
                swayingObjectRef.current.position.copy(currentPosition);
            })
            .onComplete(() => {
                setIsSwayingAnimationFinished(true);
            });
        twSwayingAnimation.chain(twSwayingBackAnimation);
        setSwayingAnimation(twSwayingAnimation);
    }

    const initAimingAnimation = () => {
        const currentPosition = swayingObjectRef.current.position;
        const finalPosition = new THREE.Vector3(-0.3, -0.01, 0)
        const returnPosition = new THREE.Vector3(0, 0, 0)
        const easing = TWEEN.Easing.Quadratic.Out;

        const twAimingAnimation = new TWEEN.Tween(currentPosition, swayingGroup)
            .to(finalPosition, 200)
            .easing(easing);

        const twAimignBackAnimation = new TWEEN.Tween(finalPosition.clone() ,swayingGroup)
            .to(returnPosition, 200)
            .easing(easing)
            .onUpdate((position) => {
                swayingObjectRef.current.position.copy(position)
            })

        setAimingAnimation(twAimingAnimation);
        setAimingBackAnimation(twAimignBackAnimation);
    }
    useEffect(() => {
        initSwayingObjectAnimation();
    }, []);
    useEffect(() => {
        initAimingAnimation();
    }, [swayingObjectRef]);
    useEffect(() => {
        if (isAiming) {
            swayingAnimation.stop();
            aimingAnimation.start();
        } else if (isAiming === false) {
            aimingBackAnimation?.start()
                .onComplete(() => {
                    swayingAnimation.stop();
                    setIsSwayingAnimationFinished(true);
                });
        }

        console.log(isAiming)
    }, [isAiming, aimingAnimation, aimingBackAnimation])

    return (
        <>
            <RigidBody colliders={false} mass={1} ref={playerRef} lockRotations>
                <mesh castShadow>
                    <capsuleGeometry args={[0.5, 0.5]} />
                    <CapsuleCollider args={[0.75, 0.5]} />
                </mesh>
            </RigidBody>
            <group ref={objectInHandRef}>
                <group ref={swayingObjectRef}>
                    <Weapon position={[0.3, -0.1, 0.3]} scale={0.3} />
                </group>
            </group>
        </>
    );
}