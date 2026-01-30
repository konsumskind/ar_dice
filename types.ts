export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface DiceProps {
  position: [number, number, number];
  onRollComplete?: (value: DiceValue) => void;
}
