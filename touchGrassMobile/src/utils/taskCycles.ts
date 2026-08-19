import type {TaskFrequency} from '../types/task';

export function getVietnamDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function getCurrentCycleKey(
  frequency: TaskFrequency,
  date = new Date(),
): string {
  if (frequency === 'ANYTIME') {
    return 'ANYTIME';
  }

  const today = getVietnamDateKey(date);
  if (frequency === 'DAILY') {
    return `DAILY:${today}`;
  }

  const monday = new Date(`${today}T00:00:00.000Z`);
  const mondayOffset = (monday.getUTCDay() + 6) % 7;
  monday.setUTCDate(monday.getUTCDate() - mondayOffset);
  return `WEEKLY:${monday.toISOString().slice(0, 10)}`;
}

export function isCurrentTaskCycle(
  cycleKey: string,
  frequency: TaskFrequency,
  date = new Date(),
): boolean {
  return cycleKey === getCurrentCycleKey(frequency, date);
}
