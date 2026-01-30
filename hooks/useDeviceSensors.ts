import { useState, useEffect, useRef, MutableRefObject } from 'react';

interface SensorValues {
  gravity: [number, number, number];
  acceleration: [number, number, number];
}

interface SensorData {
  gravity: [number, number, number]; // State for React updates (UI)
  sensorRef: MutableRefObject<SensorValues>; // Ref for high-frequency physics loop
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
}

export const useDeviceSensors = (): SensorData => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  // Default gravity (downwards on Y axis relative to screen if held upright, or Z if flat)
  const [gravity, setGravity] = useState<[number, number, number]>([0, -9.8, 0]);

  // Use a ref to store real-time sensor data for the physics loop to avoid React re-render bottlenecks
  const sensorRef = useRef<SensorValues>({
    gravity: [0, -9.8, 0],
    acceleration: [0, 0, 0],
  });

  const requestPermission = async () => {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
        } else {
          alert('Permission denied');
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Non-iOS 13+ devices (Android, Desktop) usually don't need explicit permission request
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    if (!permissionGranted) return;

    let sensorAvailable = false;

    const handleMotion = (event: DeviceMotionEvent) => {
      // If we receive valid sensor data, we mark sensors as available
      if (event.accelerationIncludingGravity && (event.accelerationIncludingGravity.x !== null || event.accelerationIncludingGravity.y !== null || event.accelerationIncludingGravity.z !== null)) {
        sensorAvailable = true;
      }

      const { accelerationIncludingGravity, acceleration } = event;
      if (!accelerationIncludingGravity) return;

      // 1. GRAVITY / ORIENTATION calculation
      const gx = accelerationIncludingGravity.x || 0;
      const gy = accelerationIncludingGravity.y || 0;
      const gz = accelerationIncludingGravity.z || 0;

      // Map to Three.js Scene:
      // Physics Gravity X = -Sensor X
      // Physics Gravity Y = -Sensor Y
      // Physics Gravity Z = -Sensor Z
      const newGravity: [number, number, number] = [-gx, -gy, -gz];

      setGravity(newGravity); // Update state for declarative Physics prop
      sensorRef.current.gravity = newGravity; // Update ref for imperative access

      // 2. LINEAR ACCELERATION (Movement) calculation
      // This allows us to simulate inertia. If phone moves left, object pushes right.
      if (acceleration) {
        const ax = acceleration.x || 0;
        const ay = acceleration.y || 0;
        const az = acceleration.z || 0;

        // Invert acceleration to simulate inertia (Force = -Acceleration * Mass)
        // If I pull phone Left (+X sensor on some devices, or -X depending on orientation), 
        // we need to check axis mapping.
        // Usually: +X is device right. If I pull right (+X), die should stay left (-X).
        sensorRef.current.acceleration = [-ax, -ay, -az];
      }
    };

    // Fallback for Desktop / Non-HTTPS interaction
    const handleMouseMove = (event: MouseEvent) => {
      if (sensorAvailable) return; // Prioritize real sensors if active

      const x = (event.clientX / window.innerWidth) * 2 - 1; // -1 to 1
      const y = (event.clientY / window.innerHeight) * 2 - 1; // -1 to 1

      // Simulate gravity tilt based on mouse position
      // Mouse right -> gravity pulls right (positive X)
      // Mouse up -> gravity pulls forward/away (negative Z)
      // Keep some downward gravity (-Y) always
      const GRAVITY_STRENGTH = 20; // Stronger to feel responsive

      const targetGx = x * GRAVITY_STRENGTH;
      const targetGz = y * GRAVITY_STRENGTH;
      const targetGy = -9.8;

      const newGravity: [number, number, number] = [targetGx, targetGy, targetGz];
      setGravity(newGravity);
      sensorRef.current.gravity = newGravity;
    };

    // Fallback for Touch (Swipe) on mobile without sensors
    const handleTouchMove = (event: TouchEvent) => {
      if (sensorAvailable) return; // Prioritize real sensors if active
      if (event.touches.length === 0) return;

      const touch = event.touches[0];
      const x = (touch.clientX / window.innerWidth) * 2 - 1;
      const y = (touch.clientY / window.innerHeight) * 2 - 1;

      const GRAVITY_STRENGTH = 20;

      const targetGx = x * GRAVITY_STRENGTH;
      const targetGz = y * GRAVITY_STRENGTH;
      const targetGy = -9.8;

      const newGravity: [number, number, number] = [targetGx, targetGy, targetGz];
      setGravity(newGravity);
      sensorRef.current.gravity = newGravity;
    };


    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [permissionGranted]);

  return { gravity, sensorRef, permissionGranted, requestPermission };
};