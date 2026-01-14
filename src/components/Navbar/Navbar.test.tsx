import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import Navbar from "./index";

import { mockAuth, resetSupabaseMocks } from "@/test/mocks";

vi.mock("@/lib/supabase/client", async () => {
  const mocks = await import("@/test/mocks");
  return {
    createClient: () => mocks.mockSupabase,
  };
});

import { mockUser } from "@/test/fixtures";
import { User } from "@supabase/supabase-js";

// Mock ResizeObserver for Radix UI
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("Navbar", () => {
  beforeAll(() => {
    // Cast to avoid TS issues with global assignment
    global.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    resetSupabaseMocks();

    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  it("renders Login/Signup links when no user", () => {
    render(<Navbar user={null} />);
    expect(screen.getByText("Connexion")).toBeInTheDocument();
    expect(screen.getByText("S'inscrire")).toBeInTheDocument();
  });

  it("renders User Avatar when user is present", () => {
    render(<Navbar user={mockUser as User} />);
    expect(screen.queryByText("Connexion")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("opens menu and handles logout", async () => {
    render(<Navbar user={mockUser as User} />);

    const trigger = screen.getByRole("button");
    trigger.focus();
    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Tableau de bord")).toBeInTheDocument();
    });

    const logoutBtn = screen.getByText("Déconnexion");
    expect(logoutBtn).toBeInTheDocument();

    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(mockAuth.signOut).toHaveBeenCalled();
    });

    expect(window.location.href).toBe("/login");
  });

  it("updates user state on auth change", async () => {
    render(<Navbar user={null} />);

    expect(screen.getByText("Connexion")).toBeInTheDocument();

    expect(mockAuth.onAuthStateChange).toHaveBeenCalled();

    act(() => {
      mockAuth.triggerAuthStateChange("SIGNED_IN", { user: mockUser as User });
    });

    await waitFor(() => {
      expect(screen.queryByText("Connexion")).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("handles null session in auth change (explicit logout check)", async () => {
    render(<Navbar user={mockUser as User} />);

    act(() => {
      mockAuth.triggerAuthStateChange("SIGNED_OUT", { session: null });
    });

    await waitFor(() => {
      expect(screen.getByText("Connexion")).toBeInTheDocument();
    });
  });

  it("renders username initial fallback", () => {
    render(<Navbar user={mockUser as User} />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders email initial fallback when username missing", () => {
    const userNoName: typeof mockUser = {
      ...mockUser,
      user_metadata: {},
      email: "alpha@example.com",
    };
    render(<Navbar user={userNoName as User} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders default user icon when no username or email", () => {
    const userEmpty: typeof mockUser = {
      ...mockUser,
      user_metadata: {},
      email: "",
    };
    render(<Navbar user={userEmpty as User} />);
    const button = screen.getByRole("button");
    expect(button).not.toHaveTextContent("T");
    expect(button).not.toHaveTextContent("A");
  });
});
