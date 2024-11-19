import {Gltf} from '@react-three/drei';
import {RigidBody} from "@react-three/rapier";

export const Ground = () => {
    return (
        <RigidBody type="fixed" colliders="trimesh">
            <Gltf 
                castShadow 
                receiveShadow 
                position={[0, -5.5, 0]} 
                rotation={[0, 0, 0]} 
                scale={1} 
                src="/court.glb"
            />
        </RigidBody>
    );
}
