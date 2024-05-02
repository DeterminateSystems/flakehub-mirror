import { makeMinorVersion } from "./index";
import { expect, test } from "vitest";

test("successfully parse valid git refs", () => {
  type SuccessCase = {
    ref: string;
    minorVersion: string;
  };

  const successCases: SuccessCase[] = [
    { ref: "nixos-unstable", minorVersion: "1" },
    { ref: "nixos-23.11", minorVersion: "2311" },
    { ref: "nixos-24.05", minorVersion: "2405" },
    { ref: "nixos-1.2", minorVersion: "12" },
  ];

  successCases.forEach(({ ref, minorVersion }) =>
    expect(makeMinorVersion(ref)).toBe(minorVersion),
  );
});

test("throw expected error for invalid Git refs", () => {
  const noMatchCases: string[] = [
    "some-random-ref",
    "nixos-something",
    "nixos-1.1.5",
    "nixos-25.06-dev",
    "nixos-1.2.3.4",
  ];

  noMatchCases.forEach((ref) => {
    expect(() => makeMinorVersion(ref)).toThrowError(
      `Branch \`${ref}\` didn't match our publishable regex.`,
    );
  });
});

test("throw expected error for empty Git ref", () => {
  expect(() => makeMinorVersion("")).toThrowError(
    "Git ref can't be an empty string",
  );
});
