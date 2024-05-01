import { makeMinorVersion } from "./index";
import { expect, test } from "vitest";

test("derive minor version from Git ref", () => {
  type SuccessCase = {
    ref: string;
    minorVersion: string;
  };

  const successCases: SuccessCase[] = [
    { ref: "nixos-unstable", minorVersion: "1" },
    { ref: "nixos-23.11", minorVersion: "2311" },
    { ref: "nixos-23.05-small", minorVersion: "2305-small" },
  ];

  successCases.forEach(({ ref, minorVersion }) =>
    expect(makeMinorVersion(ref)).toBe(minorVersion),
  );

  type ErrorCase = {
    ref: string;
    error: string;
  };

  const errorCases: ErrorCase[] = [
    {
      ref: "",
      error: "Branch didn't match our publishable regex.",
    },
    {
      ref: "some-weird-ref",
      error: "Branch didn't match our publishable regex.",
    },
    {
      ref: "nixos-something",
      error: "Branch didn't match our publishable regex.",
    },
    {
      ref: "nixos-1.1.5",
      error: "Branch didn't match our publishable regex.",
    },
  ];

  errorCases.forEach(({ ref, error }) => {
    expect(() => makeMinorVersion(ref)).toThrowError(error);
  });
});
