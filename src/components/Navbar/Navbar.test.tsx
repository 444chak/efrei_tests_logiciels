import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import Navbar from "./index";

// Mock Supabase
const mockSignOut = vi.fn();
const mockUnsubscribe = vi.fn();
let authStateChangeCallback: any = null;

const mockAuth = {
  signOut: mockSignOut,
  onAuthStateChange: vi.fn((cb) => {
    authStateChangeCallback = cb;
    return {
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    };
  }),
};

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: mockAuth,
  }),
}));

import { mockUser } from "@/test/fixtures";

// Mock ResizeObserver for Radix UI
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("Navbar", () => {
  beforeAll(() => {
    // Cast to any to avoid TS issues with global assignment
    global.ResizeObserver = ResizeObserverMock as any;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    authStateChangeCallback = null;

    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  it("renders Login/Signup links when no user", () => {
    render(<Navbar user={null} />);
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("renders User Avatar when user is present", () => {
    render(<Navbar user={mockUser} />);
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("opens menu and handles logout", async () => {
    render(<Navbar user={mockUser} />);

    // Open dropdown
    const trigger = screen.getByRole("button");
    trigger.focus();
    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);

    // Wait for dropdown content
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    const logoutBtn = screen.getByText("Log out");
    expect(logoutBtn).toBeInTheDocument();

    // Click logout
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });

    // Check redirection
    expect(window.location.href).toBe("/login");
  });

  it("updates user state on auth change", async () => {
    render(<Navbar user={null} />);

    expect(screen.getByText("Login")).toBeInTheDocument();

    expect(mockAuth.onAuthStateChange).toHaveBeenCalled();

    if (authStateChangeCallback) {
      act(() => {
        authStateChangeCallback("SIGNED_IN", { user: mockUser });
      });
    }

    await waitFor(() => {
      expect(screen.queryByText("Login")).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("handles null session in auth change (explicit logout check)", async () => {
    render(<Navbar user={mockUser} />);

    // Simulate auth change with null session
    if (authStateChangeCallback) {
      act(() => {
        authStateChangeCallback("SIGNED_OUT", { session: null });
      });
    }

    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });
  });

  it("renders username initial fallback", () => {
    // Current mockUser has username "Tester", so expects "T"
    render(<Navbar user={mockUser} />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders email initial fallback when username missing", () => {
    const userNoName: any = {
      ...mockUser,
      user_metadata: {},
      email: "alpha@example.com",
    };
    render(<Navbar user={userNoName} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders default user icon when no username or email", () => {
    const userEmpty: any = {
      ...mockUser,
      user_metadata: {},
      email: "",
    };
    render(<Navbar user={userEmpty} />);
    // When fallback fails to text, it renders UserIcon.
    // Shadcn AvatarFallback renders children.
    // We check for the SVG or a generic container if needed, but here checking
    // that no text "T" or "A" is present + UserIcon SVG class or structure is present is enough.
    // Let's assume the UserIcon renders an svg element.
    const button = screen.getByRole("button");
    // We expect the fallback NOT to have simple text content like existing username/email stats
    expect(button).not.toHaveTextContent("T");
    expect(button).not.toHaveTextContent("A");
  });
});
