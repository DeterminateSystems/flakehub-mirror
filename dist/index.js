// src/index.ts
import { inputs, stringifyError } from "detsys-ts";
import * as actionsCore from "@actions/core";
import * as github from "@actions/github";
var OUTPUT_KEY = "minorVersion";
var BRANCH_REGEX = new RegExp(
  /^nixos-(?<version>([0-9]+\.[0-9]+)|unstable)$/
);
var STABLE_TAG_NAME_REFS = {
  "15.09": "tags/15.09",
  "16.03": "tags/16.03",
  "16.09": "tags/16.09",
  "17.03": "tags/17.03",
  "17.09": "tags/17.09",
  "18.03": "tags/18.03",
  "18.09": "tags/18.09",
  "19.03": "tags/19.03",
  "19.09": "tags/19.09",
  "20.03": "tags/20.03",
  "20.09": "tags/20.09",
  "21.05": "tags/21.05",
  "21.11": "tags/21.11",
  "22.05": "tags/22.05",
  "22.11": "tags/22.11",
  "23.05": "tags/23.05",
  "23.11": "tags/23.11",
  "24.05": "tags/24.05",
  // Release wiki process changed to create a `branch-off-yy.mm` tag at time of final release.
  //
  // Note:
  // `yy.mm-beta` is the tag created at the start of preparing the release, where it branches off from master.
  // `branch-off-yy.mm` is a surprising name, but is the pattern identified in the documentation.
  //
  // See: https://github.com/NixOS/release-wiki/pull/90
  "24.11": "tags/branch-off-24.11",
  // It appears that https://github.com/NixOS/release-wiki/pull/90 was not followed for 25.05
  "25.05": "tags/25.05"
};
var FlakeHubMirrorAction = class {
  constructor() {
    this.releaseBranch = inputs.getString("release-branch");
  }
  async execute() {
    actionsCore.info(
      `Calculating the minor version for branch ${this.releaseBranch}`
    );
    try {
      const minorVersion = await getRollingMinor(this.releaseBranch);
      actionsCore.setOutput(OUTPUT_KEY, minorVersion);
    } catch (e) {
      actionsCore.setFailed(`flakehub-mirror failed: ${stringifyError(e)}`);
    }
  }
};
async function getRollingMinor(branch, testMode = false) {
  if (branch === "") {
    throw new Error("Branch name can't be empty");
  }
  const match = BRANCH_REGEX.exec(branch);
  if (match && match.groups) {
    const versionPart = match.groups.version;
    if (versionPart) {
      if (!testMode && versionPart !== "unstable") {
        const githubToken = process.env["GITHUB_TOKEN"];
        if (!githubToken) {
          throw new Error(
            "GitHub token not found; should be provided by GITHUB_TOKEN environment variable"
          );
        }
        const octokit = github.getOctokit(githubToken);
        let expectedRef;
        if (STABLE_TAG_NAME_REFS[versionPart]) {
          expectedRef = STABLE_TAG_NAME_REFS[versionPart];
        } else {
          expectedRef = `tags/branch-off-${versionPart}`;
        }
        try {
          await octokit.rest.git.getRef({
            owner: "NixOS",
            repo: "nixpkgs",
            ref: expectedRef
          });
        } catch (e) {
          throw new Error(
            `Failed to detect NixOS/nixpkgs ref ${expectedRef}: ${stringifyError(e)}`
          );
        }
      }
      const minorVersion = versionPart === "unstable" ? "1" : versionPart.replace(".", "");
      actionsCore.info(`Minor version part: ${minorVersion}`);
      return minorVersion;
    } else {
      throw new Error(
        `Version part \`${versionPart}\` is undefined in matches: ${match.groups}`
      );
    }
  } else {
    throw new Error(`Branch \`${branch}\` didn't match our publishable regex`);
  }
}
async function main() {
  await new FlakeHubMirrorAction().execute();
}
await main();
export {
  getRollingMinor
};
