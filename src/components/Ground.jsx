import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import floorTexture from "../assets/floor.jpg";
import { CuboidCollider, RigidBody } from "@react-three/rapier";


export const Ground = () => {

    const texture = useTexture(floorTexture);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    // Ajustar la repetición de la textura
    texture.repeat.set(20, 20); // Puedes ajustar estos valores según lo necesites

    return (
        <RigidBody type="fixed" colliders={false}>
            <mesh receiveShadow position={[0, 0, 0]} rotation-x={-Math.PI / 2}>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="gray" map={texture} />
            </mesh>
            <CuboidCollider args={[500,2,500]} position={[0, -2, 0]}/>
        </RigidBody>

    );
}