export const POINTS_PER_COIN = 1000;

export function coinsFromPoints(points: number) {
  if (points < 0) throw new Error("invalid");
  return Math.floor(points / POINTS_PER_COIN);
}

export function isMultipleOfConversion(points: number) {
  return points % POINTS_PER_COIN === 0;
}

export type Mark = "X" | "O" | null;
export type Board = Mark[]; // length 9

export function checkWinner(b: Board): "X" | "O" | "draw" | null {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a, c, d] of lines) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a] as "X" | "O";
  }
  if (b.every(Boolean)) return "draw";
  return null;
}