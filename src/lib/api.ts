import { supabase } from './supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL!;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function apiGet(path: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BACKEND_URL}${path}`, { headers });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function apiPost(path: string, body?: unknown) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Auth
export const signUp = (email: string, password: string) =>
  supabase.auth.signUp({ email, password });

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () => supabase.auth.signOut();

export const resetPassword = (email: string) =>
  supabase.auth.resetPasswordForEmail(email);

// Profile
export const getProfile = () => apiGet('/api/profile');

// Checkout
export const createCheckout = (plan: 'basic' | 'pro') =>
  apiPost('/api/checkout', { plan });

// Billing portal
export const openBillingPortal = () => apiPost('/api/billing-portal');

// API key
export const saveApiKey = (apiKey: string) =>
  apiPost('/api/apikey', { apiKey });

// Skip onboarding - mark as complete
export const skipOnboarding = () => apiPost('/api/onboarding/skip');

// Sessions
export const getSessions = () => apiGet('/api/sessions');

// Usage
export const getUsage = () => apiGet('/api/usage');

// Metrics
export const getMetrics = () => apiGet('/api/metrics');

// Traces
export const getTraces = () => apiGet('/api/traces');

// Chat stream
export async function streamChat(
  payload: {
    message: string;
    sessionId?: string;
    model?: string;
    mode?: string;
    effort?: string;
    maxBudget?: number;
    systemPrompt?: string;
  },
  onChunk: (data: unknown) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<{ abort: () => void }> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) { onError('Not authenticated'); return { abort: () => {} }; }

  const controller = new AbortController();

  fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal,
  }).then(async (res) => {
    if (!res.ok) { onError(`HTTP ${res.status}`); return; }
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) { onDone(); break; }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try { onChunk(JSON.parse(line.slice(6))); } catch {}
        }
      }
    }
  }).catch((err) => {
    if (err.name !== 'AbortError') onError(err.message);
  });

  return { abort: () => controller.abort() };
}

// Stop chat
export async function stopChat(requestId: string) {
  return apiPost('/api/chat/stop', { requestId });
}
