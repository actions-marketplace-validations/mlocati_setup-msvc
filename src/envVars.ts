import * as fs from 'node:fs';
import {CaseInsensitiveStringMap} from './CaseInsensitiveMap';
import * as log from './log';

function envNameNormalizer(value: string): string {
  return value.toUpperCase();
}

class PathChecker {
  private readonly cases: ReadonlyArray<string | RegExp>;
  public constructor(cases: ReadonlyArray<string | RegExp>) {
    this.cases = cases.map((item) => (item instanceof RegExp ? item : envNameNormalizer(item)));
  }
  public test(name: string): boolean {
    return this.cases.includes(envNameNormalizer(name)) || this.cases.some((s) => s instanceof RegExp && s.test(name));
  }
}

const singlePathChecker = new PathChecker([
  'DevEnvDir',
  /^FrameworkDir(32|64)?$/i,
  'FSHARPINSTALLDIR',
  'IFCPATH',
  'NETFXSDKDir',
  'UniversalCRTSdkDir',
  'VCIDEInstallDir',
  'VCINSTALLDIR',
  'VCPKG_ROOT',
  'VCToolsInstallDir',
  'VCToolsRedistDir',
  /^VS\d*COMNTOOLS$/i,
  'VSINSTALLDIR',
  /^VSSDK\d*INSTALL$/i,
  'VSSDKINSTALL',
  'WindowsSdkBinPath',
  'WindowsSdkDir',
  'WindowsSdkVerBinPath',
  /^WindowsSDK_ExecutablePath(_x86|_x64)?$/i,
]);

const multiPathChecker = new PathChecker([
  'EXTERNAL_INCLUDE',
  'INCLUDE',
  'LIB',
  'LIBPATH',
  'Path',
  'WindowsLibPath',
  '__VSCMD_PREINIT_PATH',
]);

const pathsAreSame: (path1: string, path2: string) => boolean = (function () {
  function getComparablePath(p: string): string {
    p = p.trim().toLocaleLowerCase();
    if (!/^[a-zA-Z]:[/\\]/.test(p)) {
      return p;
    }
    p = p.replace(/\//g, '\\').replace(/\\+/g, '\\').replace(/\\$/, '');
    if (p[2] === undefined) {
      p += '\\';
    }
    return p;
  }
  return function (path1: string, path2: string): boolean {
    return getComparablePath(path1) === getComparablePath(path2);
  };
})();

/**
 * Takes a path and normalizes it.
 * @returns an empty string if the path does not exist, otherwise the normalized and absolute path.
 */
function canonicalizePath(inputPath: string): string {
  if (!inputPath) {
    return '';
  }
  try {
    return fs.realpathSync.native(inputPath);
  } catch {
    return inputPath;
  }
}

export function parseSetOutput(setOutput: string): CaseInsensitiveStringMap {
  const result = new CaseInsensitiveStringMap();
  setOutput.split('\n').forEach((line) => {
    const match = line.replace(/\r+$/, '').match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      if (key) {
        result.set(key, match[2]);
      }
    }
  });
  return result;
}

export function computeEnvDelta(
  before: CaseInsensitiveStringMap,
  after: CaseInsensitiveStringMap,
): CaseInsensitiveStringMap {
  log.startDebugGroup(`Computing environment variable delta`);
  try {
    const delta = new CaseInsensitiveStringMap();
    for (const [key, afterValue] of after) {
      const beforeValue = before.get(key);
      if (beforeValue === undefined) {
        log.debug(`new: ${key}=${afterValue}`);
        delta.set(key, afterValue);
        continue;
      }
      if (afterValue === beforeValue) {
        log.debug(`unchanged: ${key}=${afterValue}`);
        continue;
      }
      if (!multiPathChecker.test(key)) {
        log.debug(`changed: ${key}=${afterValue} (was ${beforeValue})`);
        delta.set(key, afterValue);
        continue;
      }
      log.debug(`computing delta for path-list: ${key}`);
      const beforeValues = beforeValue
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const afterValues = afterValue
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const newAfterValues = afterValues.filter((av) => {
        if (beforeValues.some((bv) => pathsAreSame(bv, av))) {
          log.debug(`- path same as before, skipping: ${av}`);
          return false;
        }
        log.debug(`- new path, including in delta: ${av}`);
        return true;
      });
      if (newAfterValues.length === 0) {
        log.debug('- no new paths found, skipping environment variable');
      } else {
        delta.set(key, newAfterValues.join(';'));
      }
    }
    return delta;
  } finally {
    log.endDebugGroup();
  }
}

export function canonicalizePaths(vars: CaseInsensitiveStringMap): CaseInsensitiveStringMap {
  log.startDebugGroup(`Canonicalizing paths`);
  try {
    const result = new CaseInsensitiveStringMap();
    for (const [key, value] of vars) {
      if (singlePathChecker.test(key)) {
        const p = canonicalizePath(value);
        log.debug(`${key}: ${value} -> ${value === p ? '(unchanged)' : p}`);
        if (p) {
          result.set(key, p);
        }
      } else if (multiPathChecker.test(key)) {
        log.debug(`${key}:`);
        const paths = value
          .split(';')
          .map((s) => {
            const processed = canonicalizePath(s);
            log.debug(`- ${s} -> ${s === processed ? '(unchanged)' : processed}`);
            return processed;
          })
          .filter((s) => s !== '')
          .filter((s, index, arr) => arr.indexOf(s) === index);
        if (paths.length === 0) {
          log.debug('- no paths found, skipping environment variable');
          continue;
        }
        result.set(key, paths.join(';'));
      } else {
        log.debug(`${key}: not a path`);
        result.set(key, value);
      }
    }
    return result;
  } finally {
    log.endDebugGroup();
  }
}

export const _testInternals =
  process.env.SETUP_MSVC_TESTING === 'true'
    ? {
        envNameNormalizer,
        singlePathChecker,
        multiPathChecker,
        pathsAreSame,
        canonicalizePath,
      }
    : undefined;
