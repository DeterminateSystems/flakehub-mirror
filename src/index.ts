import * as actionsCore from "@actions/core";

const MINOR_VERSION_REGEX = new RegExp(
  /^nixos-(?<version>([0-9]+\.[0-9]+)(-small)?|unstable)$/,
);

export function makeMinorVersion(ref: string): string {
  const match = MINOR_VERSION_REGEX.exec(ref);
  if (match && match.groups) {
    const versionPart = match.groups.version;
    if (versionPart) {
      return versionPart === "unstable" ? "1" : versionPart.replace(".", "");
    } else {
      throw new Error(`Version part is undefined in matches: ${match.groups}`);
    }
  } else {
    throw new Error(`Branch \`${ref}\` didn't match our publishable regex.`);
  }
}

function main(): void {
  const context = process.env;
  const ref = process.env["RELEASE_BRANCH"];
  if (ref === undefined) {
    actionsCore.setFailed(`ref is undefined in context: ${context}`);
  } else {
    actionsCore.info(`Calculating the minor version for ${ref}`);

    try {
      const minorVersion = makeMinorVersion(ref);
      actionsCore.info(`Minor version part: ${minorVersion}`);
      actionsCore.setOutput("minorVersion", minorVersion);
    } catch (e: unknown) {
      if (typeof e === "string") {
        actionsCore.setFailed(e);
      } else if (e instanceof Error) {
        actionsCore.setFailed(e.message);
      } else {
        actionsCore.setFailed("Unknown type caught in catch block");
      }
    }
  }
}

main();
