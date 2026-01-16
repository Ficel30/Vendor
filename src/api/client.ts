class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  return envUrl || ''; // Empty string means use relative URLs (Vite proxy)
}

function withAuth(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers as HeadersInit);
  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return { ...init, headers };
}

function buildUrl(path: string): string {
  const baseUrl = getBaseUrl();
  if (baseUrl) {
    // Ensure path starts with / for proper URL joining
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }
  return path; // Use relative URL with Vite proxy
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const authInit = withAuth(init);
  const headers = new Headers(authInit.headers as HeadersInit);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const url = buildUrl(path);
  const res = await fetch(url, { credentials: 'include', headers });
  if (!res.ok) {
    let body: any = null;
    try { body = await res.json(); } catch { /* ignore */ }
    const message = body?.message ?? (Array.isArray(body?.errors) ? body.errors.map((e: any) => e.msg).join(', ') : `Request failed`);
    throw new ApiError(res.status, message, body);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const authInit = withAuth(init);
  const headers = new Headers(authInit.headers as HeadersInit);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const url = buildUrl(path);
  const res = await fetch(url, { method: 'POST', credentials: 'include', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    let data: any = null;
    try { data = await res.json(); } catch { /* ignore */ }
    const message = data?.message ?? (Array.isArray(data?.errors) ? data.errors.map((e: any) => e.msg).join(', ') : `Request failed`);
    throw new ApiError(res.status, message, data);
  }
  return res.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const authInit = withAuth(init);
  const headers = new Headers(authInit.headers as HeadersInit);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const url = buildUrl(path);
  const res = await fetch(url, { method: 'PUT', credentials: 'include', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    let data: any = null;
    try { data = await res.json(); } catch { /* ignore */ }
    const message = data?.message ?? (Array.isArray(data?.errors) ? data.errors.map((e: any) => e.msg).join(', ') : `Request failed`);
    throw new ApiError(res.status, message, data);
  }
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string, init?: RequestInit): Promise<T> {
  const authInit = withAuth(init);
  const headers = new Headers(authInit.headers as HeadersInit);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const url = buildUrl(path);
  const res = await fetch(url, { method: 'DELETE', credentials: 'include', headers });
  if (!res.ok) {
    let data: any = null;
    try { data = await res.json(); } catch { /* ignore */ }
    const message = data?.message ?? (Array.isArray(data?.errors) ? data.errors.map((e: any) => e.msg).join(', ') : `Request failed`);
    throw new ApiError(res.status, message, data);
  }
  return res.json() as Promise<T>;
}

