import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { WeaponModel } from "./WeaponModel.jsx";
import { useEffect, useRef, useState } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { usePointerLockControlsStore } from "../App.jsx";
import { create } from "zustand";
import { useRapier } from "@react-three/rapier";
import { Bullet } from "./Bullet";

import FlashShoot from "../assets/images/flash2.png";
import SingleShootAK47 from "../assets/sounds/ak7shot.mp3";

const recoilAmount = 0.03;
const recoilDuration = 100;
const easing = TWEEN.Easing.Quadratic.Out;
const recoilGroup = new TWEEN.Group();

// Controles al entrar al canvas
const SHOOT_BUTTON = parseInt(import.meta.env.VITE_SHOOT_BUTTON);
const AIM_BUTTON = parseInt(import.meta.env.VITE_AIM_BUTTON);

const FIRE_RATE = 100; // Tiempo entre disparos en milisegundos

// Estados de aim
export const useAimStore = create((set) => ({
    isAiming: null,
    setAiming: (value) => set(() => ({ isAiming: value }))
}));

export const Weapon = (props) => {
    const setAiming = useAimStore((state) => state.setAiming);
    const [recoilAnimation, setRecoilAnimation] = useState(null);
    const [recoilBackAnimation, setRecoilBackAnimation] = useState(null);
    const [isShooting, setIsShooting] = useState(false);
    const weaponRef = useRef();


    const [bullets, setBullets] = useState([]);
    const { camera } = useThree();

    // Shoot sound
    const audio = new Audio(SingleShootAK47);
    // Flash Image
    const texture = useLoader(THREE.TextureLoader, FlashShoot);
    const [flashAnimation, setFlashAnimation] = useState(null);
    const [flashOpacity, setFlashOpacity] = useState(0);

    useEffect(() => {
        const handleMouseDown = (ev) => {
            ev.preventDefault();
            mouseButtonHandler(ev.button, true);
        };
        
        const handleMouseUp = (ev) => {
            ev.preventDefault();
            mouseButtonHandler(ev.button, false);
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);

            if (shootingInterval.current) {
                clearInterval(shootingInterval.current);
            }
        };
    }, []);

    const shootingInterval = useRef(null);
    const lastShotTime = useRef(0);


    const mouseButtonHandler = (button, state) => {
        if (!usePointerLockControlsStore.getState().isLock) return;

        switch (button) {
            case SHOOT_BUTTON:
                setIsShooting(state);
                if (state) {
                    createBullet(); //Primer disparo inmediato
                    //iniciar disparos automaticos
                    if (!shootingInterval.current) {
                        shootingInterval.current = setInterval(createBullet, FIRE_RATE);
                    }
                } else {
                    // Detener disparos automáticos
                    if (shootingInterval.current) {
                        clearInterval(shootingInterval.current);
                        shootingInterval.current = null;
                    }
                }
                break;
            case AIM_BUTTON:
                setAiming(state);
                break;
        }
    };

    const createBullet = () => {
        if (!weaponRef.current) return;

        const now = Date.now();
        if (now - lastShotTime.current < FIRE_RATE) return;
        lastShotTime.current = now;

        // Obtener la dirección de la cámara en el momento del disparo
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        // Obtener la posición inicial desde el arma
        const position = new THREE.Vector3();
        weaponRef.current.getWorldPosition(position);
        
        // Ajustar la posición inicial para que salga desde el cañón
        position.add(direction.multiplyScalar(1));

        const bulletId = Date.now();
        setBullets(prev => [...prev, {
            id: bulletId,
            position: position.toArray(),
            direction: direction.toArray()
        }]);

        // Eliminar la bala después de cierto tiempo
        setTimeout(() => {
            setBullets(prev => prev.filter(bullet => bullet.id !== bulletId));
        }, 2000);
    };

    const handleBulletHit = (other) => {
        console.log("¡Impacto!", other);
        // Aquí puedes añadir efectos de impacto, daño, etc.
        // Eliminar la bala que impactó
        setBullets(prev => prev.filter(bullet => 
            bullet.position[0] !== other.rigidBodyObject.position.x ||
            bullet.position[1] !== other.rigidBodyObject.position.y ||
            bullet.position[2] !== other.rigidBodyObject.position.z
        ));
    };

    const generateRecoilOffset = () => {
        return new THREE.Vector3(
            Math.random() * recoilAmount,
            Math.random() * recoilAmount,
            Math.random() * recoilAmount,
        );
    };

    const generateNewPositionOfRecoil = (currentPosition) => {
        const recoilOffset = generateRecoilOffset();
        return currentPosition.clone().add(recoilOffset);
    };

    const initRecoilAnimation = () => {
        const currentPosition = new THREE.Vector3(0, 0, 0);
        const initialPosition = new THREE.Vector3(0, 0, 0);
        const newPosition = generateNewPositionOfRecoil(currentPosition);
        const twRecoilAnimation = new TWEEN.Tween(currentPosition, recoilGroup)
            .to(newPosition, recoilDuration)
            .easing(easing)
            .onUpdate(() => {
                weaponRef.current.position.copy(currentPosition);
            });
        const twRecoilBackAnimation = new TWEEN.Tween(currentPosition, recoilGroup)
            .to(initialPosition, recoilDuration)
            .easing(easing)
            .onUpdate(() => {
                weaponRef.current.position.copy(currentPosition);
            });
        twRecoilAnimation.chain(twRecoilBackAnimation);
        setRecoilAnimation(twRecoilAnimation);
        setRecoilBackAnimation(twRecoilBackAnimation);
    };

    const initFlashAnimation = () => {
        const currentFlashParams = { opacity: 0 };
        const twFlashAnimation = new TWEEN.Tween(currentFlashParams, recoilGroup)
            .to({ opacity: 1 }, recoilDuration)
            .easing(easing)
            .onUpdate(() => {
                setFlashOpacity(() => currentFlashParams.opacity);
            })
            .onComplete(() => {
                setFlashOpacity(() => 0);
            });
        setFlashAnimation(twFlashAnimation);
    };

    const startShooting = () => {
        recoilAnimation.start();
        flashAnimation.start();
        audio.play();
    };

    useEffect(() => {
        initRecoilAnimation();
        initFlashAnimation();

        if (isShooting) {
            startShooting();
        }
    }, [isShooting]);

    useFrame(() => {
        recoilGroup.update();
        if (isShooting) {
            startShooting();
        }
    });

    return (
        <>
            <group {...props}>
                <group ref={weaponRef}>
                    <mesh position={[0, 0.05, -2]} scale={[1, 1, 0]}>
                        <planeGeometry attach="geometry" args={[1, 1]} />
                        <meshBasicMaterial attach="material" map={texture} transparent={true} opacity={flashOpacity} />
                    </mesh>
                    <WeaponModel />
                </group>
            </group>
            {bullets.map(bullet => (
                <Bullet 
                    key={bullet.id}
                    position={bullet.position}
                    direction={bullet.direction}
                    onHit={handleBulletHit}
                />
            ))}
        </>
    );
};