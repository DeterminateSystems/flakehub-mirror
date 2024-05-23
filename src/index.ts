import { inputs } from "detsys-ts";
import * as actionsCore from "@actions/core";

const BRANCH_REGEX = new RegExp(
  /^nixos-(?<version>([0-9]+\.[0-9]+)|unstable)$/,
);

class FlakeHubMirrorAction {
  private releaseBranch: string;

  constructor() {
    this.releaseBranch = inputs.getString("release-branch");
  }

  execute(): void {
    actionsCore.info(
      `Calculating the minor version for branch ${this.releaseBranch}`,
    );

    try {
      const minorVersion = getRollingMinor(this.releaseBranch);
      actionsCore.setOutput("minorVersion", minorVersion);
    } catch (e: unknown) {
      actionsCore.setFailed(`flakehub-mirror failed: ${stringifyError(e)}`);
    }
  }
}

function stringifyError(error: unknown): string {
  return error instanceof Error || typeof error == "string"
    ? error.toString()
    : JSON.stringify(error);
}

export function getRollingMinor(branch: string): string {
  if (branch === "") {
    throw new Error("Branch name can't be empty");
  }

  const match = BRANCH_REGEX.exec(branch);
  if (match && match.groups) {
    const versionPart = match.groups.version;
    if (versionPart) {
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

function main(): void {
  new FlakeHubMirrorAction().execute();
}

main();
