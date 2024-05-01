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

  const noMatchCases: string[] = [
    "",
    "some-weird-ref",
    "nixos-something",
    "nixos-1.1.5",
    "nixos-25.06-dev",
  ];

  noMatchCases.forEach((ref) => {
    expect(() => makeMinorVersion(ref)).toThrowError(
      `Branch \`${ref}\` didn't match our publishable regex.`,
    );
  });
});
