import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fsMock from './__mocks__/fs';
import findVisualC, {_testInternals} from './findVisualC';
import {type VisualStudioVersion} from './VisualStudio';

const VSWHERE_PATH = 'C:\\Path\\To\\VSWhere.exe';

jest.mock('node:fs', () => fsMock.mock);
jest.mock('./findVSWhere', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => Promise.resolve(VSWHERE_PATH)),
}));

beforeEach(() => {
  fsMock.clear();
  core.clear();
  exec.clear();
});

const SAMPLE_VERSION_2022: VisualStudioVersion = {
  year: '2022',
  version: '17.0',
  minVersion: '17.0.0.0',
  maxVersion: '17.999.999.999',
};
const SAMPLE_VERSION_2026: VisualStudioVersion = {
  year: '2026',
  version: '18.0',
  minVersion: '18.0.0.0',
  maxVersion: '18.999.999.999',
};

describe('getVSWhereVersionArguments', () => {
  const getVSWhereVersionArguments = _testInternals?.getVSWhereVersionArguments;
  if (!getVSWhereVersionArguments) {
    throw new Error('getVSWhereVersionArguments is not available for testing');
  }

  it('should return correct arguments for specific version', () => {
    expect(getVSWhereVersionArguments('latest')).toEqual(['-latest']);
    expect(getVSWhereVersionArguments(SAMPLE_VERSION_2022)).toEqual([
      '-version',
      SAMPLE_VERSION_2022.minVersion + ',' + SAMPLE_VERSION_2022.maxVersion,
    ]);
    expect(getVSWhereVersionArguments(SAMPLE_VERSION_2026)).toEqual([
      '-version',
      SAMPLE_VERSION_2026.minVersion + ',' + SAMPLE_VERSION_2026.maxVersion,
    ]);
  });
});

describe('findVisualCWithVSWhere', () => {
  const findVisualCWithVSWhere = _testInternals?.findVisualCWithVSWhere;
  if (!findVisualCWithVSWhere) {
    throw new Error('findVisualCWithVSWhere is not available for testing');
  }

  it('should find Visual C++ with valid vswhere output', async () => {
    const vsPath = 'C:\\Path\\To\\Visual Studio\\2022\\Edition';
    const vcPath = vsPath + '\\VC';
    fsMock.addMockPath(vcPath, 'dir');
    exec.addExecResult({
      stdout: JSON.stringify([
        {
          installationPath: vsPath,
          installationVersion: '17.3.5',
        },
      ]),
      stderr: '',
      exitCode: 0,
    });

    const result = await findVisualCWithVSWhere(SAMPLE_VERSION_2022, VSWHERE_PATH);
    expect(result).toEqual({
      vsVersion: SAMPLE_VERSION_2022,
      path: vcPath,
    });
    expect(core.getLoggedMessages()).toContain(
      `DEBUG: Visual C++ of Visual Studio ${SAMPLE_VERSION_2022.year} found by vswhere.exe at: ${vcPath}`,
    );
  });

  it('should throw error if vswhere output is invalid', async () => {
    exec.addExecResult({
      stdout: JSON.stringify([
        {
          installationPath: null,
          installationVersion: '17.3.5',
        },
      ]),
      stderr: '',
      exitCode: 0,
    });
    await expect(findVisualCWithVSWhere(SAMPLE_VERSION_2022, VSWHERE_PATH)).rejects.toThrow(
      `Unable to find Visual C++ for Visual Studio ${SAMPLE_VERSION_2022.year}`,
    );
    expect(core.getLoggedMessages()).toContain(
      'DEBUG: Invalid vswhere output: {"installationPath":null,"installationVersion":"17.3.5"}',
    );
  });

  it('should throw error if vswhere reports a non existing path', async () => {
    fsMock.addMockPath('C:\\Invalid\\Path\\VC', false);
    exec.addExecResult({
      stdout: JSON.stringify([
        {
          installationPath: 'C:\\Invalid\\Path',
          installationVersion: '17.3.5',
        },
      ]),
      stderr: '',
      exitCode: 0,
    });

    await expect(findVisualCWithVSWhere('latest', VSWHERE_PATH)).rejects.toThrow(
      'Unable to find any Visual C++ installation',
    );
    expect(core.getLoggedMessages()).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/DEBUG: Visual C\+\+ not found at expected path: C:[\\\/]Invalid[\\\/]Path[\\\/]VC/),
      ]),
    );
  });

  it('should throw error if vswhere reports an invalid version', async () => {
    fsMock.addMockPath('C:\\Valid\\Path\\VC', 'dir');
    exec.addExecResult({
      stdout: JSON.stringify([
        {
          installationPath: 'C:\\Valid\\Path',
          installationVersion: '0.1.2.3',
        },
      ]),
      stderr: '',
      exitCode: 0,
    });

    await expect(findVisualCWithVSWhere(SAMPLE_VERSION_2022, VSWHERE_PATH)).rejects.toThrow(
      `Unknown Visual Studio version: 0.1.2.3`,
    );
  });
});

describe('findVisualCInDefaultPaths', () => {
  const findVisualCInDefaultPaths = _testInternals?.findVisualCInDefaultPaths;
  if (!findVisualCInDefaultPaths) {
    throw new Error('findVisualCInDefaultPaths is not available for testing');
  }

  it('should throw error if no Visual C++ installation is found', async () => {
    expect(() => findVisualCInDefaultPaths(SAMPLE_VERSION_2022)).toThrow(
      `Unable to find Visual C++ for Visual Studio ${SAMPLE_VERSION_2022.year}`,
    );
    expect(() => findVisualCInDefaultPaths('latest')).toThrow('Unable to find any Visual C++ installation');
  });

  it('should find Visual C++ (with year)', () => {
    const programFiles = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    fsMock.addMockPath(`${programFiles}\\Microsoft Visual Studio\\2022\\Enterprise\\VC`, 'dir');
    const result = findVisualCInDefaultPaths(SAMPLE_VERSION_2022);
    expect(result).toEqual({
      vsVersion: SAMPLE_VERSION_2022,
      path: `${programFiles}\\Microsoft Visual Studio\\2022\\Enterprise\\VC`,
    });
  });

  it('should find Visual C++ (with version)', () => {
    const programFiles = process.env['ProgramW6432'] || process.env['ProgramFiles'] || 'C:\\Program Files';
    fsMock.addMockPath(`${programFiles}\\Microsoft Visual Studio\\17\\Enterprise\\VC`, 'dir');
    const result = findVisualCInDefaultPaths(SAMPLE_VERSION_2022);
    expect(result).toEqual({
      vsVersion: SAMPLE_VERSION_2022,
      path: `${programFiles}\\Microsoft Visual Studio\\17\\Enterprise\\VC`,
    });
  });

  it('should find Visual C++ (old syntax)', () => {
    const programFiles = process.env['ProgramW6432'] || process.env['ProgramFiles'] || 'C:\\Program Files';
    fsMock.addMockPath(`${programFiles}\\Microsoft Visual Studio 17.0\\VC`, 'dir');
    const result = findVisualCInDefaultPaths(SAMPLE_VERSION_2022);
    expect(result).toEqual({
      vsVersion: SAMPLE_VERSION_2022,
      path: `${programFiles}\\Microsoft Visual Studio 17.0\\VC`,
    });
  });

  it('should find Visual C++ (latest version)', () => {
    const programFiles = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    fsMock.addMockPath(`${programFiles}\\Microsoft Visual Studio\\2022\\Enterprise\\VC`, 'dir');
    fsMock.addMockPath(`${programFiles}\\Microsoft Visual Studio\\2019\\Enterprise\\VC`, 'dir');
    const result = findVisualCInDefaultPaths('latest');
    expect(result).toEqual({
      vsVersion: SAMPLE_VERSION_2022,
      path: `${programFiles}\\Microsoft Visual Studio\\2022\\Enterprise\\VC`,
    });
  });

  it('should find Visual C++ (most complete version)', () => {
    const programFiles = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    fsMock.addMockPath(`${programFiles}\\Microsoft Visual Studio\\2022\\Community\\VC`, 'dir');
    fsMock.addMockPath(`${programFiles}\\Microsoft Visual Studio\\2022\\Enterprise\\VC`, 'dir');
    const result = findVisualCInDefaultPaths(SAMPLE_VERSION_2022);
    expect(result).toEqual({
      vsVersion: SAMPLE_VERSION_2022,
      path: `${programFiles}\\Microsoft Visual Studio\\2022\\Enterprise\\VC`,
    });
  });
});

describe('findVisualC', () => {
  it('should find Visual C++ with vswhere', async () => {
    const vsPath = 'C:\\Path\\To\\Visual Studio\\2022\\Edition';
    const vcPath = vsPath + '\\VC';
    fsMock.addMockPath(vcPath, 'dir');
    exec.addExecResult({
      stdout: JSON.stringify([
        {
          installationPath: vsPath,
          installationVersion: '17.3.5',
        },
      ]),
      stderr: '',
      exitCode: 0,
    });

    const result = await findVisualC(SAMPLE_VERSION_2022);
    expect(result).toEqual({
      vsVersion: SAMPLE_VERSION_2022,
      path: vcPath,
    });
  });

  it('should find Visual C++ in default paths if vswhere fails', async () => {
    const programFiles = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const vcPath = `${programFiles}\\Microsoft Visual Studio\\2022\\Enterprise\\VC`;
    fsMock.addMockPath(vcPath, 'dir');
    exec.addExecResult({
      stdout: '',
      stderr: 'vswhere failed',
      exitCode: 1,
    });

    const result = await findVisualC(SAMPLE_VERSION_2022);
    expect(result).toEqual({
      vsVersion: SAMPLE_VERSION_2022,
      path: vcPath,
    });
  });

  it('should throw error if vswhere fails and no installation is found in default paths', async () => {
    exec.addExecResult({
      stdout: '',
      stderr: 'vswhere failed',
      exitCode: 1,
    });
    const programFiles = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const vcPath = `${programFiles}\\Microsoft Visual Studio\\2015\\Enterprise\\VC`;
    fsMock.addMockPath(vcPath, 'dir');

    await expect(findVisualC(SAMPLE_VERSION_2022)).rejects.toThrow(
      `Unable to find Visual C++ for Visual Studio ${SAMPLE_VERSION_2022.year}`,
    );
  });

  it('should throw error if vswhere fails and no installation is found in default paths', async () => {
    exec.addExecResult({
      stdout: '',
      stderr: 'vswhere failed',
      exitCode: 1,
    });
    await expect(findVisualC('latest')).rejects.toThrow('Unable to find any Visual C++ installation');
  });
});
