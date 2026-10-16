// Faint dotted network behind the hero, as in the CodeLaunch template.
const NODES: [number, number][] = [[6, 14], [19, 8], [33, 22], [47, 10], [61, 26], [74, 12], [88, 20], [95, 38], [12, 48], [28, 62], [42, 44], [58, 70], [72, 54], [86, 66], [8, 84], [36, 90], [64, 92], [92, 88]];
const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [2, 10], [10, 9], [8, 9], [4, 12], [12, 11], [12, 13], [9, 15], [11, 16], [13, 17], [8, 0]];

export function NetworkBg() {
  return (
    <svg aria-hidden className="net-bg pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {EDGES.map(([a, b], i) => <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} stroke="#2346FF" strokeOpacity="0.10" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
      {NODES.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="0.35" fill="#2346FF" fillOpacity="0.55" />)}
    </svg>
  );
}
