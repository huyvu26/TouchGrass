import {API_BASE_URL} from '../config/api';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    status: string;
  };
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(
    `${API_BASE_URL}/health`,
  );

  if (!response.ok) {
    throw new Error(
      `Health API failed: ${response.status}`,
    );
  }

  const data =
    (await response.json()) as HealthResponse;

  return data;
}