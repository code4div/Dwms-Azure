/**
 * Lightweight API client matching Axios interface using Next.js / native fetch.
 * Works seamlessly in client-side and server-side Next.js environments.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export const api = {
  async post<T = any>(endpoint: string, data?: any, config?: RequestInit): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    
    // Static authentication as configured: admin / password
    if (endpoint.includes('/auth/signin')) {
      const userIdentifier = (data?.username || data?.email || '').trim().toLowerCase();
      const isPasswordValid = data?.password === 'password';
      const isUserValid =
        userIdentifier === 'admin' ||
        userIdentifier === 'admin@cmms.com' ||
        userIdentifier === 'admin@dwms.com';

      if (isUserValid && isPasswordValid) {
        return {
          data: {
            token: 'dwms-static-jwt-token',
            userId: 'usr-001',
            username: 'admin',
            email: 'admin@dwms.com',
            role: 'admin',
          } as any,
          status: 200,
          statusText: 'OK',
          headers: {},
        };
      } else {
        const error: any = new Error(
          'Invalid credentials. Please use username "admin" and password "password".'
        );
        error.response = {
          data: {
            message:
              'Invalid credentials. Please use username "admin" and password "password".',
          },
          status: 401,
          statusText: 'Unauthorized',
        };
        throw error;
      }
    }

    if (endpoint.includes('/auth/signup')) {
      return {
        data: {
          token: 'dwms-static-jwt-token',
          userId: 'usr-001',
          username: data?.username || 'admin',
          email: data?.email || 'admin@dwms.com',
          role: 'admin',
        } as any,
        status: 200,
        statusText: 'OK',
        headers: {},
      };
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((config?.headers as Record<string, string>) || {}),
      };

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        ...config,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const error: any = new Error(errorData.message || `Request failed with status ${res.status}`);
        error.response = {
          data: errorData,
          status: res.status,
          statusText: res.statusText,
        };
        throw error;
      }

      const resData = await res.json();
      return {
        data: resData,
        status: res.status,
        statusText: res.statusText,
        headers: {},
      };
    } catch (err: any) {
      // If no backend API server is running on this route, provide local development mock fallback
      if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
        console.warn(`[DWMS API] Backend at ${url} not reachable. Using fallback authentication for local development.`);
        
        // Provide mock response for auth routes in local testing
        if (endpoint.includes('/auth/signin') || endpoint.includes('/auth/signup')) {
          const isAdmin = data?.email === 'admin@cmms.com' || data?.username === 'admin' || data?.email?.includes('admin');
          return {
            data: {
              token: 'dwms-mock-jwt-token-' + Date.now(),
              userId: 'usr-001',
              username: data?.username || data?.email?.split('@')[0] || 'admin',
              email: data?.email,
              role: isAdmin ? 'admin' : 'user',
            } as any,
            status: 200,
            statusText: 'OK',
            headers: {},
          };
        }
      }
      throw err;
    }
  },

  async get<T = any>(endpoint: string, config?: RequestInit): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((config?.headers as Record<string, string>) || {}),
    };

    const res = await fetch(url, {
      method: 'GET',
      headers,
      ...config,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error: any = new Error(errorData.message || `Request failed with status ${res.status}`);
      error.response = {
        data: errorData,
        status: res.status,
        statusText: res.statusText,
      };
      throw error;
    }

    const resData = await res.json();
    return {
      data: resData,
      status: res.status,
      statusText: res.statusText,
      headers: {},
    };
  },
};
