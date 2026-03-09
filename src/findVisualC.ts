import * as fs from 'node:fs';
import * as path from 'node:path';
import * as log from './log';
import run from './runner';
import findVSWhere from './findVSWhere';
import {
  type VisualStudioVersion,
  type LatestVersion,
  versions as visualStudioVersions,
  getVisualStudioVersionBySpecificVersion,
} from './VisualStudio';

interface FoundVisualC {
  readonly vsVersion: VisualStudioVersion;
  readonly path: string;
}

/**
 * Generates the version filter for vswhere.exe based on the provided Visual Studio version.
 * @returns {string[]} The arguments to be passed to vswhere.exe for filtering by version.
 * @example ['-latest']
 * @example ['-version', '17.0.0.0,17.999.999.999']
 */
function getVSWhereVersionArguments(version: VisualStudioVersion | LatestVersion) {
  if (version === 'latest') {
    return ['-latest'];
  }
  return ['-version', `${version.minVersion},${version.maxVersion}`];
}

/**
 * Finds the Visual C++ installation path using vswhere.exe.
 */
async function findVisualCWithVSWhere(
  version: VisualStudioVersion | LatestVersion,
  vsWherePath: string,
): Promise<FoundVisualC> {
  const args: string[] = [
    '-products',
    '*',
    ...getVSWhereVersionArguments(version),
    '-requires',
    'Microsoft.VisualStudio.Component.VC.Tools.x86.x64',
    '-format',
    'json',
  ];
  const result = await run(`"${vsWherePath}"`, args, {
    throwIfNonZeroExitCode: true,
  });
  const data = JSON.parse(result.stdout) as Record<string, any>[];
  for (const entry of data) {
    if (
      typeof entry?.installationPath !== 'string' ||
      entry.installationPath === '' ||
      typeof entry.installationVersion !== 'string' ||
      !/^\d/.test(entry.installationVersion)
    ) {
      log.debug(`Invalid vswhere output: ${JSON.stringify(entry)}`);
      continue;
    }
    let visualCPath: string = path.join(entry.installationPath, 'VC');
    if (!fs.existsSync(visualCPath) || !fs.statSync(visualCPath).isDirectory()) {
      log.debug(`Visual C++ not found at expected path: ${visualCPath}`);
      continue;
    }
    const vsVersion = getVisualStudioVersionBySpecificVersion(entry.installationVersion);
    if (vsVersion === null) {
      throw new Error(`Unknown Visual Studio version: ${entry.installationVersion}`);
    }
    visualCPath = fs.realpathSync.native(visualCPath);
    log.debug(`Visual C++ of Visual Studio ${vsVersion.year} found by vswhere.exe at: ${visualCPath}`);
    return {vsVersion, path: visualCPath};
  }
  if (version !== 'latest') {
    throw new Error(`Unable to find Visual C++ for Visual Studio ${version.year}`);
  }
  throw new Error(`Unable to find any Visual C++ installation`);
}

/**
 * Finds the Visual C++ installation path in the default installation paths.
 */
function findVisualCInDefaultPaths(version: VisualStudioVersion | LatestVersion): FoundVisualC {
  const searchVersions = version === 'latest' ? [...visualStudioVersions].reverse() : [version];
  const programFilesPaths = [
    process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)',
    process.env['ProgramW6432'] || process.env['ProgramFiles'] || 'C:\\Program Files',
  ];
  const editions = ['Enterprise', 'Professional', 'Community', 'BuildTools'];
  for (const searchVersion of searchVersions) {
    for (const programFilesPath of programFilesPaths) {
      for (const [editionIndex, edition] of editions.entries()) {
        const defaultPaths = [
          // Example: C:\Program Files\Microsoft Visual Studio\18\Community\VC
          path.join(programFilesPath, 'Microsoft Visual Studio', searchVersion.version.split('.')[0], edition, 'VC'),
          // Example: C:\Program Files\Microsoft Visual Studio\2022\Community\VC
          path.join(programFilesPath, 'Microsoft Visual Studio', searchVersion.year, edition, 'VC'),
        ];
        if (editionIndex === 0) {
          // Example: C:\Program Files (x86)\Microsoft Visual Studio 14.0\VC
          defaultPaths.push(path.join(programFilesPath, `Microsoft Visual Studio ${searchVersion.version}`, 'VC'));
        }
        for (const defaultPath of defaultPaths) {
          if (fs.existsSync(defaultPath) && fs.statSync(defaultPath).isDirectory()) {
            const realPath = fs.realpathSync.native(defaultPath);
            log.debug(`Visual C++ found at default path: ${realPath}`);
            return {
              vsVersion: searchVersion,
              path: realPath,
            };
          }
        }
      }
    }
  }
  if (version !== 'latest') {
    throw new Error(`Unable to find Visual C++ for Visual Studio ${version.year}`);
  }
  throw new Error(`Unable to find any Visual C++ installation`);
}

/**
 * Find the Visual C++ installation path for the specified Visual Studio version.
 */
export default async function findVisualC(version: VisualStudioVersion | LatestVersion): Promise<FoundVisualC> {
  let vsWherePath: string | undefined;
  try {
    vsWherePath = await findVSWhere();
  } catch {}
  log.startDebugGroup('Finding Visual C++');
  try {
    if (vsWherePath) {
      try {
        return await findVisualCWithVSWhere(version, vsWherePath);
      } catch (err) {
        log.debug(`Failed to find Visual C++ with vswhere.exe: ${err instanceof Error ? err.message : err}`);
      }
    }
    try {
      return findVisualCInDefaultPaths(version);
    } catch (err) {
      log.debug(`Failed to find Visual C++ with in paths: ${err instanceof Error ? err.message : err}`);
    }
    if (version !== 'latest') {
      throw new Error(`Unable to find Visual C++ for Visual Studio ${version.year}`);
    }
    throw new Error(`Unable to find any Visual C++ installation`);
  } finally {
    log.endDebugGroup();
  }
}

export const _testInternals =
  process.env.SETUP_MSVC_TESTING === 'true'
    ? {
        getVSWhereVersionArguments,
        findVisualCWithVSWhere,
        findVisualCInDefaultPaths,
      }
    : undefined;
