import { describe, it, expect } from "vitest";
import { cn, formatDate, formatTime } from "./utils";

describe("Utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      expect(cn("c1", "c2")).toBe("c1 c2");
    });

    it("should handle conditional classes", () => {
      expect(cn("c1", true && "c2", false && "c3")).toBe("c1 c2");
    });

    it("should merge tailwind classes using tailwind-merge", () => {
      // implies twMerge is working
      expect(cn("p-4 p-2")).toBe("p-2");
    });
  });

  describe("formatDate", () => {
    it("should format date correctly in French", () => {
      // Fixed date for testing
      const date = new Date("2023-01-01T12:00:00");
      // Note: internal locale usually depends on system, but we requested 'fr-FR' in the function
      // Expected: "dim. 1 janvier 2023" (short weekday) or "dimanche 1 janvier 2023" depending on 'short'
      const result = formatDate(date);
      expect(result).toMatch(/janvier 2023/);
      expect(result).toMatch(/1/);
    });
  });

  describe("formatTime", () => {
    it("should format time correctly", () => {
      const date = new Date("2023-01-01T14:30:00");
      expect(formatTime(date)).toBe("14:30");
    });
  });
});
