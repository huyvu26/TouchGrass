import {
  getCurrentCycleKey,
  isCurrentTaskCycle,
} from '../src/utils/taskCycles';

describe('task cycle keys', () => {
  const wednesdayInVietnam = new Date('2026-08-19T12:00:00.000Z');

  it('resets a daily task on the next Vietnam calendar day', () => {
    expect(getCurrentCycleKey('DAILY', wednesdayInVietnam)).toBe(
      'DAILY:2026-08-19',
    );
    expect(isCurrentTaskCycle('DAILY:2026-08-18', 'DAILY', wednesdayInVietnam)).toBe(false);
  });

  it('keeps a weekly task hidden until the following Monday', () => {
    expect(getCurrentCycleKey('WEEKLY', wednesdayInVietnam)).toBe(
      'WEEKLY:2026-08-17',
    );
    expect(isCurrentTaskCycle('WEEKLY:2026-08-17', 'WEEKLY', wednesdayInVietnam)).toBe(true);
    expect(isCurrentTaskCycle('WEEKLY:2026-08-10', 'WEEKLY', wednesdayInVietnam)).toBe(false);
  });

  it('treats an anytime task as a one-time task', () => {
    expect(getCurrentCycleKey('ANYTIME', wednesdayInVietnam)).toBe('ANYTIME');
    expect(isCurrentTaskCycle('ANYTIME', 'ANYTIME', wednesdayInVietnam)).toBe(true);
  });
});
