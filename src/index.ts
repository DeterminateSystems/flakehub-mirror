import { inputs, stringifyError } from "detsys-ts";
import * as actionsCore from "@actions/core";
import * as github from "@actions/github";

const OUTPUT_KEY = "minorVersion";

const BRANCH_REGEX = new RegExp(
  /^nixos-(?<version>([0-9]+\.[0-9]+)|unstable)$/,
);

class FlakeHubMirrorAction {
  private releaseBranch: string;

  constructor() {
    this.releaseBranch = inputs.getString("release-branch");
  }

  async execute(): Promise<void> {
    actionsCore.info(
      `Calculating the minor version for branch ${this.releaseBranch}`,
    );

    try {
      const minorVersion = await getRollingMinor(this.releaseBranch);
      actionsCore.setOutput(OUTPUT_KEY, minorVersion);
    } catch (e: unknown) {
      actionsCore.setFailed(`flakehub-mirror failed: ${stringifyError(e)}`);
    }
  }
}

export async function getRollingMinor(branch: string): Promise<string> {
  const githubToken = process.env["GITHUB_TOKEN"];

  if (!githubToken) {
    throw new Error(
      "GitHub token not found; should be provided by GITHUB_TOKEN environment variable",
    );
  }

  const octokit = github.getOctokit(githubToken);

  if (branch === "") {
    throw new Error("Branch name can't be empty");
  }

  const match = BRANCH_REGEX.exec(branch);
  if (match && match.groups) {
    const versionPart = match.groups.version;
    if (versionPart) {
      // Check that NixOS/nixpkgs has the tag nixos-${versionPart}
      try {
        await octokit.rest.git.getRef({
          owner: "NixOS",
          repo: "nixpkgs",
          ref: versionPart,
        });
      } catch (e: unknown) {
        throw new Error(
          `Failed to detect NixOS/nixpkgs ref ${versionPart}: ${stringifyError(e)}`,
        );
      }

      const minorVersion =
        versionPart === "unstable" ? "1" : versionPart.replace(".", "");
      actionsCore.info(`Minor version part: ${minorVersion}`);
      return minorVersion;
    } else {
      throw new Error(
        `Version part ${versionPart} is undefined in matches: ${match.groups}`,
      );
    }
  } else {
    throw new Error(`Branch ${branch} didn't match our publishable regex`);
  }
}

async function main(): Promise<void> {
  await new FlakeHubMirrorAction().execute();
}

await main();