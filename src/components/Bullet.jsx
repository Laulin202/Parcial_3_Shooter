import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

const BULLET_SPEED = 50;
const BULLET_LIFETIME = 2000; // 2 segundos

export const Bullet = ({ position, direction, onHit }) => {

    const bulletRef = useRef();
    const initialVelocity = useRef(new THREE.Vector3(...direction).normalize().multiplyScalar(BULLET_SPEED));


    useEffect(() => {
        if (!bulletRef.current) return;

        // Establecer velocidad inicial
        const velocity = initialVelocity.current;
        bulletRef.current.setLinvel({ x: velocity.x, y: velocity.y, z: velocity.z });
        
        // Establecer rotación inicial
        const bulletRotation = new THREE.Quaternion();
        bulletRotation.setFromUnitVectors(
            new THREE.Vector3(0, 0, 1), 
            new THREE.Vector3(...direction).normalize()
        );
        bulletRef.current.setRotation(bulletRotation);

        // Asegurarse de que la bala esté activa
        bulletRef.current.setEnabled(true);
    }, []);

    return (
        <RigidBody
            ref={bulletRef}
            position={position}
            type="dynamic"
            colliders="ball"
            sensor
            onIntersectionEnter={(e) => {
                if (e.other.rigidBody) {
                    onHit(e.other);
                    // Eliminar la bala al impactar
                    bulletRef.current?.setEnabled(false);
                }
            }}
            gravityScale={0}
            linearDamping={0}
            angularDamping={1} // Evitar que la bala gire
        >
             <mesh>
                <capsuleGeometry args={[0.02, 0.08]} />
                <meshStandardMaterial 
                    color="#ffff00" 
                    emissive="#ffff00" 
                    emissiveIntensity={2} 
                    toneMapped={false}
                />
            </mesh>
        </RigidBody>
    );
};