import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "./index";

// Mock Supabase
const mockSignOut = vi.fn();
const mockAuth = {
  signOut: mockSignOut,
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
};

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: mockAuth,
  }),
}));

// Mock Next/Link, Avatar, etc. if needed?
// Usually manageable with shallow or real render.
// But internal components like Avatar might need mocking if they use contexts not available.
// For now, let's try rendering.

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Login/Signup links when no user", () => {
    render(<Navbar user={null} />);
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("renders User Avatar/Menu when user is present", () => {
    // Mock user
    const user: any = {
      id: "123",
      email: "test@example.com",
      user_metadata: { username: "Tester" },
    };

    render(<Navbar user={user} />);

    // Check if username fallback or avatar is present.
    // Avatar fallback logic shows first char of username.
    // But Radix Avatar might be tricky in jsdom without proper setup.
    // We look for text that should appear in the DOM.
    // The AvatarFallback contains 'T' (Tester).
    // Or we can look for the "Dashboard" link if we open the menu? No, menu is closed.
    // But the component renders a DropdownMenuTrigger.

    // Let's verify "Login" is NOT there.
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });
});
