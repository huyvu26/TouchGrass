import type {GpsPoint} from '../types/userTask';

const EARTH_RADIUS_METERS = 6_371_000;
const MAX_WALKING_SPEED_KMH = 15;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function haversineDistanceMeters(
  previous: GpsPoint,
  current: GpsPoint,
): number {
  const latitudeDelta = toRadians(current.latitude - previous.latitude);
  const longitudeDelta = toRadians(current.longitude - previous.longitude);
  const previousLatitude = toRadians(previous.latitude);
  const currentLatitude = toRadians(current.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(previousLatitude) *
      Math.cos(currentLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.asin(Math.min(1, Math.sqrt(haversine)))
  );
}

export function getValidWalkingSegmentMeters(
  previous: GpsPoint,
  current: GpsPoint,
): number {
  const elapsedSeconds =
    (Date.parse(current.timestamp) - Date.parse(previous.timestamp)) / 1000;
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) {
    return 0;
  }

  const distanceMeters = haversineDistanceMeters(previous, current);
  const minimumMovementMeters = Math.max(
    2,
    Math.max(previous.accuracy, current.accuracy) * 0.15,
  );
  const speedKmh = (distanceMeters / elapsedSeconds) * 3.6;

  if (
    !Number.isFinite(distanceMeters) ||
    distanceMeters < minimumMovementMeters ||
    speedKmh > MAX_WALKING_SPEED_KMH
  ) {
    return 0;
  }

  return distanceMeters;
}
