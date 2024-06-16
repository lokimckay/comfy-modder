import { atom, computed } from "nanostores";

type NodeProgress = {
  id: string;
  progress: number;
};

type RunProgress = {
  id: string;
  promptId: string;
  running: boolean;
  nodes: NodeProgress[];
  progress: number;
};

export const $running = atom(false);
export const $runsProgress = atom<RunProgress[]>([]);
export const $progress = computed($runsProgress, (runs) => {
  if (runs.length === 0) return 0;
  const total = runs.reduce((acc, run) => acc + run.progress, 0);
  return total / runs.length;
});
