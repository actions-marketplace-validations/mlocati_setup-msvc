import type {Stats} from 'node:fs';

let fallsBackToFalse = true;

interface ExistingPath {
  realPath: string;
  type: 'file' | 'dir';
}

let knownPaths: Record<string, ExistingPath | false> = {};

function pathToKey(path: string): string {
  return path.toUpperCase().replace(/\\/g, '/').replace(/\/+$/, '');
}
export function clear() {
  knownPaths = {};
  fallsBackToFalse = true;
}

export function setFallbackToFalse(value: boolean): void {
  fallsBackToFalse = value;
}
export function addMockPath(path: string, value: 'file' | 'dir' | false) {
  knownPaths[pathToKey(path)] = value === false ? false : {realPath: path, type: value};
}

export const mock = {
  ...jest.requireActual('node:fs'),
  existsSync: jest.fn((p: string): boolean => {
    const key = pathToKey(p);
    if (!knownPaths.hasOwnProperty(key)) {
      if (fallsBackToFalse) {
        return false;
      }
      return jest.requireActual('node:fs').existsSync(p);
    }
    return knownPaths[key] !== false;
  }),
  statSync: jest.fn((p: string): Stats => {
    const knownPath = knownPaths[pathToKey(p)];
    if (knownPath === undefined) {
      if (fallsBackToFalse) {
        throw new Error(`ENOENT: no such file or directory, stat '${p}'`);
      }
      return jest.requireActual('node:fs').statSync(p);
    }
    if (knownPath === false) {
      throw new Error(`ENOENT: no such file or directory, stat '${p}'`);
    }
    return {
      isFile: () => knownPath.type === 'file',
      isDirectory: () => knownPath.type === 'dir',
    } as Stats;
  }),
  realpathSync: {
    native: jest.fn((p: string): string => {
      const knownPath = knownPaths[pathToKey(p)];
      if (knownPath === undefined) {
        if (fallsBackToFalse) {
          throw new Error(`ENOENT: no such file or directory, realpath '${p}'`);
        }
        return jest.requireActual('node:fs').realpathSync.native(p);
      }
      if (knownPath === false) {
        throw new Error(`ENOENT: no such file or directory, realpath '${p}'`);
      }
      return knownPath.realPath;
    }),
  },
};
