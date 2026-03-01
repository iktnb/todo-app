import type { BoardCoreState } from "./board-store";

export function toBoardCoreState(input: BoardCoreState): BoardCoreState {
  return { ...input };
}
