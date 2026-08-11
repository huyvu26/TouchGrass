import type {
  TaskCategory,
  TaskDifficulty,
  TaskFrequency,
  TaskTargetUnit,
  TaskVerificationType,
} from './task';

export type UserTaskStatus =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type UserTaskVerificationStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'PASSED'
  | 'FAILED';

export interface MlKitLabel {
  text: string;
  confidence: number;
}

export interface PhotoVerificationResponse {
  userTaskId: string;
  verificationStatus: UserTaskVerificationStatus;
  passed: boolean;
  photoAccepted: boolean;
  progress: number;
  targetValue: number;
  acceptedPhotoCount: number;
  requiredPhotoCount: number;
  result: {
    label: string | null;
    confidence: number | null;
    capturedAt: string | null;
  };
  failureReason: 'LABEL_NOT_ACCEPTED' | 'LOW_CONFIDENCE' | null;
  alreadyProcessed: boolean;
}

export interface GpsPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface GpsVerificationResponse {
  userTaskId: string;
  verificationStatus: UserTaskVerificationStatus;
  passed: boolean;
  progress: number;
  targetValue: number;
  trackingStartedAt: string | null;
  trackingEndedAt: string | null;
  summary: {
    distanceMeters: number;
    durationSeconds: number;
    averageSpeedKmh: number;
    sampleCount: number;
  };
  failureReason: string | null;
  alreadyProcessed: boolean;
}

export interface ScreenTimerVerificationResponse {
  userTaskId: string;
  verificationStatus: UserTaskVerificationStatus;
  passed: boolean;
  progress: number;
  targetValue: number;
  targetSeconds: number;
  timerStartedAt: string | null;
  timerEndedAt: string | null;
  screenOffAt: string | null;
  screenOnAt: string | null;
  durationSeconds: number;
  failureReason: 'TARGET_NOT_REACHED' | null;
  alreadyProcessed: boolean;
}

export interface StartUserTaskResponse {
  id: string;
  userId: string;
  taskId: string;
  cycleKey: string;
  status: UserTaskStatus;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  expiresAt: string | null;
  rewardGranted: boolean;
  verificationStatus: UserTaskVerificationStatus;
  verificationAttempts: number;
}

export interface UserTaskDefinition {
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
  startTime?: string | null;
  endTime?: string | null;
}

export interface UserTaskDetail {
  _id: string;
  user: string;
  task: UserTaskDefinition;
  cycleKey: string;
  status: UserTaskStatus;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  expiresAt: string | null;
  rewardGranted: boolean;
  verificationStatus: UserTaskVerificationStatus;
  verificationAttempts: number;
  verifiedAt?: string | null;
  trackingStartedAt?: string | null;
  trackingEndedAt?: string | null;
  distanceMeters?: number;
  durationSeconds?: number;
  averageSpeedKmh?: number;
  gpsSampleCount?: number;
  verificationFailureReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserTaskListResponse {
  items: UserTaskDetail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateUserTaskProgressResponse {
  _id: string;
  user: string;
  task: string;
  cycleKey: string;
  status: UserTaskStatus;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  expiresAt: string | null;
  rewardGranted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteTaskResponse {
  userTask: {
    id: string;
    status: UserTaskStatus;
    progress: number;
    completedAt: string | null;
    rewardGranted: boolean;
  };
  task: {
    id: string;
    title: string;
    emoji: string;
  };
  rewardPreview: {
    xp: number;
    leafPoints: number;
    unlockMinutes: number;
  };
}

export interface ClaimRewardResponse {
  userTask: {
    id: string;
    status: UserTaskStatus;
    rewardGranted: boolean;
  };
  reward: {
    xp: number;
    leafPoints: number;
    unlockMinutes: number;
  };
  profile: {
    xp: number;
    level: number;
    leafPoints: number;
    unlockMinutesBalance: number;
  };
  alreadyClaimed: boolean;
}
