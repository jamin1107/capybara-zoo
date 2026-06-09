import * as THREE from 'three';

export function createPerturbedGeometry(
  geometry: THREE.BufferGeometry,
  amount: number = 0.05
): THREE.BufferGeometry {
  const perturbed = geometry.clone();
  const positions = perturbed.attributes.position.array as Float32Array;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += (Math.random() - 0.5) * amount;
    positions[i + 1] += (Math.random() - 0.5) * amount;
    positions[i + 2] += (Math.random() - 0.5) * amount;
  }

  perturbed.computeVertexNormals();
  return perturbed;
}

export function randomBrownColor(): THREE.Color {
  const brownRange: [number, number][] = [
    [0.45, 0.65],
    [0.25, 0.45],
    [0.15, 0.30],
  ];
  return new THREE.Color(
    brownRange[0][0] + Math.random() * (brownRange[0][1] - brownRange[0][0]),
    brownRange[1][0] + Math.random() * (brownRange[1][1] - brownRange[1][0]),
    brownRange[2][0] + Math.random() * (brownRange[2][1] - brownRange[2][0])
  );
}

export function randomGreenColor(): THREE.Color {
  const greenRange: [number, number][] = [
    [0.15, 0.35],
    [0.50, 0.75],
    [0.10, 0.25],
  ];
  return new THREE.Color(
    greenRange[0][0] + Math.random() * (greenRange[0][1] - greenRange[0][0]),
    greenRange[1][0] + Math.random() * (greenRange[1][1] - greenRange[1][0]),
    greenRange[2][0] + Math.random() * (greenRange[2][1] - greenRange[2][0])
  );
}

export function roundedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  segments: number = 3,
  radius: number = 0.1
): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(width, height, depth, segments, segments, segments);
  return createPerturbedGeometry(geometry, radius);
}
