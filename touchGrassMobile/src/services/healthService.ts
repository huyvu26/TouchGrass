import {apiRequest} from './apiClient';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    status: string;
  };
}

export async function getHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health', {authenticated: false});
}
