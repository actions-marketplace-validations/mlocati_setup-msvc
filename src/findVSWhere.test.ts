import * as core from '@actions/core';
import * as fsMock from './__mocks__/fs';
import findVSWhere from './findVSWhere';

let findCommandResult: string | Error = new Error('not found');

jest.mock('node:fs', () => fsMock.mock);
jest.mock('./findCommand', () => {
  return {
    __esModule: true,
    default: jest.fn(async (command: string) => {
      if (findCommandResult instanceof Error) {
        throw findCommandResult;
      }
      return findCommandResult;
    }),
  };
});

beforeEach(() => {
  fsMock.clear();
  core.clear();
  findCommandResult = new Error('not found');
});

describe('findVSWhere', () => {
  it('finds vswhere.exe with where.exe', async () => {
    findCommandResult = 'C:\\path\\to\\vswhere.exe';
    const path = await findVSWhere();
    expect(path).toBe('C:\\path\\to\\vswhere.exe');
  });

  it('finds vswhere.exe in known paths (1)', async () => {
    const prefix = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const defaultPath = prefix + '\\Microsoft Visual Studio\\Installer\\vswhere.exe';
    fsMock.addMockPath(defaultPath, 'file');
    const path = await findVSWhere();
    expect(path).toBe(defaultPath);
  });

  it('finds vswhere.exe in known paths (2)', async () => {
    const prefix = process.env['ProgramW6432'] || process.env['ProgramFiles'] || 'C:\\Program Files';
    const defaultPath = prefix + '\\Microsoft Visual Studio\\Installer\\vswhere.exe';
    fsMock.addMockPath(defaultPath, 'file');
    const path = await findVSWhere();
    expect(path).toBe(defaultPath);
  });

  it('throws if vswhere.exe is not found', async () => {
    await expect(findVSWhere()).rejects.toThrow('Unable to find vswhere.exe');
  });
});
