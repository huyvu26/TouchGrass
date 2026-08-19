import {
  getValidWalkingSegmentMeters,
  haversineDistanceMeters,
} from '../src/utils/gpsDistance';
import type {GpsPoint} from '../src/types/userTask';

function point(
  latitude: number,
  timestamp: string,
  accuracy = 10,
): GpsPoint {
  return {
    latitude,
    longitude: 106.660172,
    accuracy,
    timestamp,
  };
}

describe('GPS realtime distance', () => {
  it('calculates distance using Haversine', () => {
    const distance = haversineDistanceMeters(
      point(10.762622, '2026-08-19T00:00:00.000Z'),
      point(10.763622, '2026-08-19T00:01:00.000Z'),
    );
    expect(distance).toBeGreaterThan(110);
    expect(distance).toBeLessThan(112);
  });

  it('ignores movement smaller than the accuracy-based noise threshold', () => {
    expect(
      getValidWalkingSegmentMeters(
        point(10.762622, '2026-08-19T00:00:00.000Z', 20),
        point(10.762632, '2026-08-19T00:00:02.000Z', 20),
      ),
    ).toBe(0);
  });

  it('ignores segments faster than walking speed', () => {
    expect(
      getValidWalkingSegmentMeters(
        point(10.762622, '2026-08-19T00:00:00.000Z'),
        point(10.763622, '2026-08-19T00:00:02.000Z'),
      ),
    ).toBe(0);
  });
});
