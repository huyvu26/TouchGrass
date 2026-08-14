import {getApiBaseUrl} from '../storage/apiConfigStorage';
import {
  getAccessToken,
  removeAccessToken,
} from '../storage/authStorage';

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  authenticated?: boolean;
  headers?: Record<string, string>;
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(
  handler: UnauthorizedHandler | null,
): void {
  unauthorizedHandler = handler;
}

function errorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const response = data as ApiErrorResponse;
  if (Array.isArray(response.message)) {
    return response.message.join('\n');
  }

  return response.message ?? response.error ?? fallback;
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const authenticated = options.authenticated ?? true;
  const headers: Record<string, string> = {...options.headers};

  if (authenticated) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new ApiError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.', 401);
    }
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const isFormData = options.body instanceof FormData;
  if (options.body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(`${await getApiBaseUrl()}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body:
        options.body === undefined
          ? undefined
          : isFormData
            ? (options.body as FormData)
            : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(
      'Không thể kết nối với máy chủ. Hãy kiểm tra mạng và backend.',
      0,
    );
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      await removeAccessToken();
      unauthorizedHandler?.();
    }

    throw new ApiError(
      errorMessage(data, `Yêu cầu thất bại (${response.status}).`),
      response.status,
    );
  }

  return data as T;
}
