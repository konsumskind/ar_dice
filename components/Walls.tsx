import React from 'react';
import { useThree } from '@react-three/fiber';
import { usePlane } from '@react-three/cannon';
import * as THREE from 'three';

export const Walls: React.FC = () => {
  const { camera, viewport } = useThree();

  // Calculate the viewport size specifically at the floor level (z = -2)
  const { width: viewportWidth, height: viewportHeight } = viewport.getCurrentViewport(camera, [0, 0, -2]);

  // Make the room smaller than the actual screen.
  // Factor 0.85 creates a safety margin so the dice (which has thickness) 
  // hits the wall and stays fully visible instead of getting cut off at the edge.
  const width = viewportWidth * 0.85;
  const height = viewportHeight * 0.85;

  // Visual parameters
  const wallHeight = 10; // Height of walls in Z-axis
  const wallZ = 3;       // Center Z position for walls ((-2 + 8) / 2)
  
  // Using slightly off-white helps shadows appear more defined than pure #ffffff
  const materialProps = { 
    color: '#f5f5f5', 
    roughness: 0.8,
    metalness: 0.1
  };

  // Floor (Physics)
  usePlane(() => ({
    position: [0, 0, -2],
    rotation: [0, 0, 0],
    type: 'Static',
    material: { friction: 0.1, restitution: 0.5 }
  }));
  
  // Ceiling (Physics)
  usePlane(() => ({
    position: [0, 0, 8], 
    rotation: [0, -Math.PI, 0],
    type: 'Static',
  }));

  // Left Wall (Physics)
  usePlane(() => ({
    position: [-width / 2, 0, 0],
    rotation: [0, Math.PI / 2, 0],
  }));

  // Right Wall (Physics)
  usePlane(() => ({
    position: [width / 2, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
  }));

  // Top Wall (Physics)
  usePlane(() => ({
    position: [0, height / 2, 0],
    rotation: [Math.PI / 2, 0, 0],
  }));

  // Bottom Wall (Physics)
  usePlane(() => ({
    position: [0, -height / 2, 0],
    rotation: [-Math.PI / 2, 0, 0],
  }));

  return (
    <group>
      {/* Floor Visual */}
      <mesh position={[0, 0, -2]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Left Wall Visual */}
      <mesh position={[-width / 2, 0, wallZ]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[wallHeight, height]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Right Wall Visual */}
      <mesh position={[width / 2, 0, wallZ]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[wallHeight, height]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Top Wall Visual */}
      <mesh position={[0, height / 2, wallZ]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, wallHeight]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Bottom Wall Visual */}
      <mesh position={[0, -height / 2, wallZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, wallHeight]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
    </group>
  );
};