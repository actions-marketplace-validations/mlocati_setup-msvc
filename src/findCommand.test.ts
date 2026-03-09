import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fsMock from './__mocks__/fs';
import findCommand, {_testInternals} from './findCommand';
import path from 'node:path';

jest.mock('node:fs', () => fsMock.mock);

beforeEach(() => {
  core.clear();
  exec.clear();
  testInternals.whereExePath = undefined;
  fsMock.clear();
});

const WHERE_EXE_PATH = path.join(
  process.env.SystemRoot || process.env.windir || 'C:\\Windows',
  'System32',
  'where.exe',
);

const getWhereExePath = _testInternals?.getWhereExePath;
if (!getWhereExePath) {
  throw new Error('getWhereExePath is not available for testing');
}

const testInternals = _testInternals as {whereExePath?: string};

describe('findCommand', () => {
  it('should throw if where.exe cannot be found', async () => {
    fsMock.addMockPath(WHERE_EXE_PATH, false);
    expect(() => getWhereExePath()).toThrow(/where\.exe not found/);
  });

  it('should return where.exe full path if it exists', async () => {
    fsMock.addMockPath(WHERE_EXE_PATH, 'file');
    expect(getWhereExePath()).toBe(WHERE_EXE_PATH);
  });

  it('where.exe should be looked up once', async () => {
    fsMock.addMockPath(WHERE_EXE_PATH, 'file');
    expect(testInternals.whereExePath).toBeUndefined();
    expect(getWhereExePath()).toBe(WHERE_EXE_PATH);
    expect(testInternals.whereExePath).toBe(WHERE_EXE_PATH);
    expect(getWhereExePath()).toBe(WHERE_EXE_PATH);
  });

  it('should find a known command', async () => {
    fsMock.addMockPath(WHERE_EXE_PATH, 'file');
    exec.addExecResult({
      stdout: `${WHERE_EXE_PATH}\n`,
      stderr: '',
      exitCode: 0,
    });
    const wherePath = await findCommand('wHeRe.eXe');
    expect(wherePath).toBe(WHERE_EXE_PATH);
    expect(core.getLoggedMessages()).toContain(`DEBUG: wHeRe.eXe found by where.exe at ${WHERE_EXE_PATH}`);
  });

  it('should not find an unknown command', async () => {
    fsMock.addMockPath(WHERE_EXE_PATH, 'file');
    exec.addExecResult({
      stdout: '',
      stderr: 'INFO: Could not find files for the given pattern(s).\n',
      exitCode: 1,
    });
    await expect(async () => await findCommand('un_knownCoMMand')).rejects.toThrow(/Unable to find un_knownCoMMand/);
  });
});
