export type TaskCategory =
  | 'WALK'
  | 'PHOTO'
  | 'OFFLINE'
  | 'WELLNESS';

export type TaskVerificationType =
  | 'GPS_DISTANCE'
  | 'PHOTO_AI'
  | 'SCREEN_OFF_TIMER'
  | 'MANUAL_CHECKIN';

export type TaskFrequency = 'DAILY' | 'WEEKLY' | 'ANYTIME';

export type TaskDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type TaskTargetUnit = 'METER' | 'PHOTO' | 'MINUTE';

export interface Task {
  _id: string;
  code: string;
  title: string;
  description: string;
  category: TaskCategory;
  verificationType: TaskVerificationType;
  verificationLabels?: string[];
  frequency: TaskFrequency;
  emoji: string;
  difficulty: TaskDifficulty;
  rewardXp: number;
  rewardLp: number;
  unlockMinutes: number;
  targetValue: number;
  targetUnit: TaskTargetUnit;
  estimatedMinutes: number;
  instructions: string[];
  startTime: string | null;
  endTime: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
