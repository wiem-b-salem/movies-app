export function matchRate(a: Array<string | number>, b: Array<string | number>): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const total = new Set([...setA, ...setB]).size;
  if (total === 0) return 0;

  let common = 0;
  setA.forEach(id => {
    if (setB.has(id)) common++;
  });

  return (common / total) * 100;
}
