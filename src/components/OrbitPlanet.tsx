type Cell = [x: number, y: number, w: number, h: number];

const LAYER_1: Cell[] = [
  [2, 0, 2, 1],
  [1, 1, 2, 1],
  [0, 2, 2, 1],
  [0, 3, 1, 1],
];

const LAYER_2: Cell[] = [
  [4, 0, 1, 1],
  [3, 1, 2, 1],
  [2, 2, 3, 1],
  [1, 3, 3, 1],
  [1, 4, 2, 1],
  [2, 5, 1, 1],
];

const LAYER_3: Cell[] = [
  [5, 1, 1, 1],
  [5, 2, 2, 1],
  [4, 3, 3, 1],
  [3, 4, 3, 1],
  [3, 5, 2, 1],
  [2, 6, 3, 1],
];

function cells(list: Cell[], fill: string) {
  return (
    <g fill={fill}>
      {list.map(([x, y, w, h]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} />
      ))}
    </g>
  );
}

export default function OrbitPlanet() {
  return (
    <span className="orbit-planet" aria-hidden="true">
      <svg viewBox="0 0 7 7" width={16} height={16} focusable="false" aria-hidden="true">
        {cells(LAYER_1, 'var(--planet-1)')}
        {cells(LAYER_2, 'var(--planet-2)')}
        {cells(LAYER_3, 'var(--planet-3)')}
      </svg>
    </span>
  );
}
