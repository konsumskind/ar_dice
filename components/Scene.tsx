import React, { MutableRefObject, useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import Die from './Die';
import { Walls } from './Walls';

interface SceneProps {
  gravity: [number, number, number];
  sensorRef: MutableRefObject<{
    gravity: [number, number, number];
    acceleration: [number, number, number];
  }>;
}

/**
 * CameraRig handles the "Orbit" effect and Calibration.
 */
const CameraRig = ({ sensorRef }: { sensorRef: MutableRefObject<any> }) => {
  const { gl } = useThree();
  
  // Pivot point: The center of the floor
  const pivot = new THREE.Vector3(0, 0, -2);
  const targetPos = new THREE.Vector3();
  const dummyVec = new THREE.Vector3();
  
  // Calibration State
  const [isCalibrated, setIsCalibrated] = useState(false);
  const calibrationOffset = useRef({ x: 0, y: 0 });

  // 1. Setup Click Listener for Calibration
  useEffect(() => {
    const handlePointerDown = () => {
      const currentG = sensorRef.current.gravity;
      calibrationOffset.current = { 
        x: currentG[0] / 9.8, 
        y: currentG[1] / 9.8 
      };
      setIsCalibrated(true);
    };

    const canvasEl = gl.domElement;
    canvasEl.addEventListener('pointerdown', handlePointerDown);
    return () => canvasEl.removeEventListener('pointerdown', handlePointerDown);
  }, [gl, sensorRef]);

  // Config
  const radius = 16; 

  const angledBase = new THREE.Vector3(0, -6, 14).normalize().multiplyScalar(radius);
  const topDownBase = new THREE.Vector3(0, 0, 16).normalize().multiplyScalar(radius);

  useFrame((state) => {
    const { gravity } = sensorRef.current;
    
    // Normalize Gravity
    const rawNormGx = gravity[0] / 9.8;
    const rawNormGy = gravity[1] / 9.8;

    // Apply Calibration Offset
    const normGx = rawNormGx - (isCalibrated ? calibrationOffset.current.x : 0);
    const normGy = rawNormGy - (isCalibrated ? calibrationOffset.current.y : 0);

    // Clamp values
    const maxTilt = 0.6; 
    const clampedX = THREE.MathUtils.clamp(normGx, -maxTilt, maxTilt);
    const clampedY = THREE.MathUtils.clamp(normGy, -maxTilt, maxTilt);

    // Choose Base Vector
    const activeBase = isCalibrated ? topDownBase : angledBase;

    // Apply Rotation
    dummyVec.copy(activeBase);
    dummyVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), -clampedX * maxTilt);
    dummyVec.applyAxisAngle(new THREE.Vector3(1, 0, 0), clampedY * maxTilt);

    // Final Position
    targetPos.copy(pivot).add(dummyVec);

    // Smooth Camera Movement
    state.camera.position.lerp(targetPos, 0.1);
    state.camera.lookAt(pivot);
  });

  return null;
};

export const Scene: React.FC<SceneProps> = ({ gravity, sensorRef }) => {
  return (
    <Canvas
      dpr={[1, 2]} // Support high-DPI screens for crisp edges
      camera={{ position: [0, -6, 14], fov: 40 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
    >
      <Suspense fallback={null}>
        <CameraRig sensorRef={sensorRef} />

        {/* 
          Environment:
          Provides reflections and basic image-based lighting.
        */}
        <Environment preset="city" background={false} blur={0.5} />

        <Physics gravity={gravity} defaultContactMaterial={{ friction: 0.1, restitution: 0.5 }}>
          <Walls />
          <Die position={[0, 0, 5]} sensorRef={sensorRef} />
          <Die position={[1, 2, 5]} sensorRef={sensorRef} />
        </Physics>
      </Suspense>
    </Canvas>
  );
};