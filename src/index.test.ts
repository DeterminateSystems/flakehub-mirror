import { expect, test } from 'vitest'
import { getRollingMinor } from './index.js'

type SuccessCase = {
  branch: string
  minorVersion: string
}

type ErrorCase = {
  branch: string
  error: string
}

test('properly formed branches produce expected rolling minor versions', async () => {
  const successCases: SuccessCase[] = [
    { branch: 'nixos-unstable', minorVersion: '1' },
    { branch: 'nixos-22.11', minorVersion: '2211' },
    { branch: 'nixos-23.05', minorVersion: '2305' },
    { branch: 'nixos-23.11', minorVersion: '2311' },
    { branch: 'nixos-24.05', minorVersion: '2405' },
    { branch: 'nixos-24.11', minorVersion: '2411' },
  ]

  for (const { branch, minorVersion } of successCases) {
    expect(await getRollingMinor(branch, true)).toEqual(minorVersion)
  }
})

test('malformed branches produce expected errors', async () => {
  const errorCases: ErrorCase[] = [
    {
      branch: '',
      error: "Branch name can't be empty",
    },
    {
      branch: 'foo',
      error: "Branch `foo` didn't match our publishable regex",
    },
    {
      branch: 'nixos-12345',
      error: "Branch `nixos-12345` didn't match our publishable regex",
    },
    {
      branch: 'other-24.05-unstable',
      error: "Branch `other-24.05-unstable` didn't match our publishable regex",
    },
  ]

  for (const { branch, error } of errorCases) {
    await expect(getRollingMinor(branch, true)).rejects.toThrowError(
      new Error(error),
    )
  }
})
