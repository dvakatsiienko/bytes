import { type Memory, memoryList } from './data';

export const typeColorVar: Record<Memory['type'], string> = {
  feedback: 'var(--ember)',
  project: 'var(--lichen)',
  reference: 'var(--tide)',
  unknown: 'var(--dim)',
  user: 'var(--pulse)',
};

const nameSet = new Set(
  memoryList.map((memory) => {
    return memory.name;
  }),
);

export const edgeList = memoryList.flatMap((memory) => {
  return memory.links.map((target) => {
    return { dangling: !nameSet.has(target), source: memory.name, target };
  });
});

export const backlinkCount = (name: string) => {
  return edgeList.filter((edge) => {
    return edge.target === name;
  }).length;
};

export const degree = (memory: Memory) => {
  return memory.links.length + backlinkCount(memory.name);
};

export const poolStats = {
  danglingLinks: edgeList.filter((edge) => {
    return edge.dangling;
  }).length,
  indexed: memoryList.filter((memory) => {
    return memory.inIndex;
  }).length,
  links: edgeList.length,
  memories: memoryList.length,
  orphans: memoryList.filter((memory) => {
    return degree(memory) === 0;
  }).length,
  types: Object.entries(
    memoryList.reduce<Record<string, number>>((acc, memory) => {
      acc[memory.type] = (acc[memory.type] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => {
    return b[1] - a[1];
  }),
};
