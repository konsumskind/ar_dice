import React from 'react';
import { usePlane } from '@react-three/cannon';
import { useThree } from '@react-three/fiber';

// Helper component for visual walls
const WallVisual: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
}> = ({ position, rotation, size }) => {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color="white" roughness={0.8} />
    </mesh>
  );
};

export const Walls: React.FC = () => {
  // Fixed room size
  const { viewport } = useThree();
  const width = viewport.width;
  const height = viewport.height;
  const depth = 10; // From Z=-2 to Z=8 approx

  // Physics Definitions (Invisible Infinite Planes)

  // Floor (Physics)
  usePlane(() => ({
    position: [0, 0, 0],
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
  }), undefined, [width]);

  // Right Wall (Physics)
  usePlane(() => ({
    position: [width / 2, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
  }), undefined, [width]);

  // Top Wall (Physics)
  usePlane(() => ({
    position: [0, height / 2, 0],
    rotation: [Math.PI / 2, 0, 0],
  }), undefined, [height]);

  // Bottom Wall (Physics)
  usePlane(() => ({
    position: [0, -height / 2, 0],
    rotation: [-Math.PI / 2, 0, 0],
  }), undefined, [height]);

  return (
    <group>
      {/* Floor Visual (5x5) */}
      <WallVisual position={[0, 0, 0]} rotation={[0, 0, 0]} size={[99999, 99999]} />

      {/* Ceiling Visual (5x5)
      <WallVisual position={[0, 0, 8]} rotation={[0, -Math.PI, 0]} size={[width, height]} /> */}

      {/* Left Wall Visual (YZ Plane -> args: [Depth, Height] based on rotation?) 
          Plane is XY. Rotated Y 90 -> YZ.
          Local X maps to Global Z. Local Y maps to Global Y.
          Global Z size is 10 (from -2 to 8). Global Y size is 5.
          So args should be [10, 5].
          Center Z: (-2 + 8)/2 = 3.
          Center Y: 0.
          Position X: -2.5.
          Note: Physics wall was at Z=0? No, standard plane is infinite.
          But for visual box, we need correct center.
          The defined "room" limits:
          Z from -2 to 8. Midpoint Z = 3. Length = 10.
          Y from -2.5 to 2.5. Midpoint Y = 0. Length = 5.
          X from -2.5 to 2.5. Midpoint X = 0. Length = 5.
      */}

      {/* Left Wall Visual */}
      {/* <WallVisual
        position={[-width / 2, 0, 3]} // Shifted Z to center of room
        rotation={[0, Math.PI / 2, 0]}
        size={[10, height]} // [Depth, Height]
      /> */}

      {/* Right Wall Visual */}
      {/* <WallVisual
        position={[width / 2, 0, 3]}
        rotation={[0, -Math.PI / 2, 0]}
        size={[10, height]}
      /> */}

      {/* Top Wall Visual (XZ Plane -> Rotated X 90 -> Local X=X, Local Y=Z)
          Global X Size: 5. Global Z Size: 10.
          Args: [5, 10].
          Center: X=0, Z=3.
      */}
      {/* <WallVisual
        position={[0, height / 2, 3]}
        rotation={[Math.PI / 2, 0, 0]}
        size={[width, 10]}
      /> */}

      {/* Bottom Wall Visual */}
      {/* <WallVisual
        position={[0, -height / 2, 3]}
        rotation={[-Math.PI / 2, 0, 0]}
        size={[width, 10]}
      /> */}
    </group>
  );
};