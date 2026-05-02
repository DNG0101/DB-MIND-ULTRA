export type Command = {
  id: string;
  type: string;
  payload: any;
  inversePayload: any;
  timestamp: number;
  affects: string[];
};

export type CommandHistory = {
  history: Command[];
  index: number;
};

export function createEmptyHistory(): CommandHistory {
  return { history: [], index: -1 };
}
