import React, { MutableRefObject } from 'react';
import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface DieProps {
  position: [number, number, number];
  impulse?: [number, number, number];
  sensorRef?: MutableRefObject<{
    gravity: [number, number, number];
    acceleration: [number, number, number];
  }>;
}

const Die: React.FC<DieProps> = ({ position, sensorRef }) => {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [1, 1, 1], // Physics body size
    material: { friction: 0.1, restitution: 0.7 },
    allowSleep: false,
    linearDamping: 0.1,
    angularDamping: 0.1,
  }));

  useFrame(() => {
    if (!sensorRef) return;
    const [ax, ay, az] = sensorRef.current.acceleration;

    const threshold = 0.5;
    const forceMultiplier = 15;

    if (Math.abs(ax) > threshold || Math.abs(ay) > threshold || Math.abs(az) > threshold) {
      api.applyForce(
        [ax * forceMultiplier, ay * forceMultiplier, az * forceMultiplier],
        [0, 0, 0]
      );

      if (Math.abs(ax) > 5 || Math.abs(ay) > 5) {
        api.applyTorque([ax, ay, az]);
      }
    }
  });

  const handlePointerDown = () => {
    api.applyImpulse(
      [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, 10],
      [0, 0, 0]
    );
    api.applyTorque([Math.random() * 10, Math.random() * 10, Math.random() * 10]);
  };

  // Gold material for the pips
  // Using slightly less metalness to make it look like painted gold inlay
  const pipMaterial = (
    <meshStandardMaterial
      color="#FFD700"
      roughness={0.2}
      metalness={1.0}
      envMapIntensity={1.5}
    />
  );

  const pipRadius = 0.12;
  const pipDepth = 0.01;

  return (
    <group ref={ref as any}>
      {/* 
           FIX: Removed outer <mesh>. 
           RoundedBox is a mesh itself. We apply castShadow directly to it.
        */}
      <RoundedBox
        args={[1, 1, 1]}
        radius={0.1}
        smoothness={4}
        castShadow
        receiveShadow
        onClick={handlePointerDown}
      >
        {/* 
                MeshPhysicalMaterial is key for the "Glass/Acrylic" look.
              */}
        <meshPhysicalMaterial
          color="#ff0000"           // Base Red
          roughness={0.1}           // Very smooth
          metalness={0.0}           // Glass is dielectric, not metallic
          transmission={0.95}       // High transparency
          thickness={1.5}           // Volume thickness
          ior={1.5}                 // Index of Refraction (Acrylic/Glass)
          attenuationColor="#660000" // Darker red absorption inside
          attenuationDistance={1.0}
          clearcoat={1.0}           // Extra polish layer
          clearcoatRoughness={0.0}
          envMapIntensity={1.5}
        />
      </RoundedBox>

      {/* Pips - Gold - Added castShadow/receiveShadow to them as well */}

      {/* Side 1 (Right +X) */}
      <mesh position={[0.505, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <circleGeometry args={[pipRadius, 32]} />
        {pipMaterial}
      </mesh>

      {/* Side 6 (Left -X) */}
      <group position={[-0.505, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[-0.22, -0.22, 0]} castShadow receiveShadow><circleGeometry args={[0.09, 32]} />{pipMaterial}</mesh>
        <mesh position={[-0.22, 0.22, 0]} castShadow receiveShadow><circleGeometry args={[0.09, 32]} />{pipMaterial}</mesh>
        <mesh position={[-0.22, 0, 0]} castShadow receiveShadow><circleGeometry args={[0.09, 32]} />{pipMaterial}</mesh>
        <mesh position={[0.22, -0.22, 0]} castShadow receiveShadow><circleGeometry args={[0.09, 32]} />{pipMaterial}</mesh>
        <mesh position={[0.22, 0.22, 0]} castShadow receiveShadow><circleGeometry args={[0.09, 32]} />{pipMaterial}</mesh>
        <mesh position={[0.22, 0, 0]} castShadow receiveShadow><circleGeometry args={[0.09, 32]} />{pipMaterial}</mesh>
      </group>

      {/* Top (+Y) 2 */}
      <group position={[0, 0.505, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[-0.22, -0.22, 0]} castShadow receiveShadow><circleGeometry args={[pipRadius, 32]} />{pipMaterial}</mesh>
        <mesh position={[0.22, 0.22, 0]} castShadow receiveShadow><circleGeometry args={[pipRadius, 32]} />{pipMaterial}</mesh>
      </group>

      {/* Bottom (-Y) 5 */}
      <group position={[0, -0.505, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh position={[-0.22, -0.22, 0]} castShadow receiveShadow><circleGeometry args={[0.09, 32]} />{pipMaterial}</mesh>
        <mesh position={[0.22, 0.22, 0]} castShadow receiveShadow><circleGeometry args={[0.09, 32]} />{pipMaterial}</mesh>
        <mesh position={[-0.22, 0.22, 0]} castShadow receiveShadow><circleGeometry args={[0.09, 32]} />{pipMaterial}</mesh>
        <mesh position={[0.22, -0.22, 0]} castShadow receiveShadow><circleGeometry args={[0.09, 32]} />{pipMaterial}</mesh>
        <mesh position={[0, 0, 0]} castShadow receiveShadow><circleGeometry args={[0.09, 32]} />{pipMaterial}</mesh>
      </group>

      {/* Front (+Z) 3 */}
      <group position={[0, 0, 0.505]}>
        <mesh position={[-0.22, -0.22, 0]} castShadow receiveShadow><circleGeometry args={[pipRadius, 32]} />{pipMaterial}</mesh>
        <mesh position={[0, 0, 0]} castShadow receiveShadow><circleGeometry args={[pipRadius, 32]} />{pipMaterial}</mesh>
        <mesh position={[0.22, 0.22, 0]} castShadow receiveShadow><circleGeometry args={[pipRadius, 32]} />{pipMaterial}</mesh>
      </group>
      {/* Back (-Z) 4 */}
      <group position={[0, 0, -0.505]} rotation={[0, Math.PI, 0]}>
        <mesh position={[-0.22, -0.22, 0]} castShadow receiveShadow><circleGeometry args={[pipRadius, 32]} />{pipMaterial}</mesh>
        <mesh position={[0.22, -0.22, 0]} castShadow receiveShadow><circleGeometry args={[pipRadius, 32]} />{pipMaterial}</mesh>
        <mesh position={[-0.22, 0.22, 0]} castShadow receiveShadow><circleGeometry args={[pipRadius, 32]} />{pipMaterial}</mesh>
        <mesh position={[0.22, 0.22, 0]} castShadow receiveShadow><circleGeometry args={[pipRadius, 32]} />{pipMaterial}</mesh>
      </group>
    </group>
  );
};

export default Die;