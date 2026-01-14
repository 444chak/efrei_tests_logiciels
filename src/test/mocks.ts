import { vi } from "vitest";

// --- Mock Router ---
const refreshMock = vi.fn();
const pushMock = vi.fn();

export const mockRouter = {
  refresh: refreshMock,
  push: pushMock,
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

// Hook implementation to be used in vi.mock("next/navigation")
export const mockUseRouter = () => mockRouter;

// Helper to reset router spies
export const resetMockRouter = () => {
  refreshMock.mockClear();
  pushMock.mockClear();
};

// --- Mock Sonner (Toast) ---
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  message: vi.fn(),
  dismiss: vi.fn(),
};

// --- Mock Supabase ---
const mockSignOut = vi.fn();
const mockUnsubscribe = vi.fn();
let authStateChangeCallback: ((event: string, session: any) => void) | null =
  null;

export const mockAuth = {
  signOut: mockSignOut,
  onAuthStateChange: vi.fn((cb) => {
    authStateChangeCallback = cb;
    return {
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    };
  }),
  // Helper to trigger state changes in tests
  triggerAuthStateChange: (event: string, session: any) => {
    if (authStateChangeCallback) {
      authStateChangeCallback(event, session);
    }
  },
};

export const mockSupabase = {
  auth: mockAuth,
};

export const resetSupabaseMocks = () => {
  mockSignOut.mockClear();
  mockUnsubscribe.mockClear();
  authStateChangeCallback = null;
  mockAuth.onAuthStateChange.mockClear();
};
