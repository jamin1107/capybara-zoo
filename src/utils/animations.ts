export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

export const lerpVector3 = (
  start: [number, number, number],
  end: [number, number, number],
  t: number
): [number, number, number] => {
  return [
    lerp(start[0], end[0], t),
    lerp(start[1], end[1], t),
    lerp(start[2], end[2], t),
  ];
};

export const ANIMATION_DURATION = {
  IDLE_BOB: 2,
  WALK_CYCLE: 0.5,
  EATING: 2,
  PLAYING: 3,
  BATHING: 4,
  HAPPY: 2,
  POSITION_MOVE: 1.5,
};
