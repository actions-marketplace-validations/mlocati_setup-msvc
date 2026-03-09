import * as core from '@actions/core';
import checkPlatform from './checkPlatform';
import resolveInputs from './inputsResolver';
import findVisualC from './findVisualC';
import {Architecture} from './vcvarsall-enviro-inspector';
import {run} from './main';

// Mock all local dependencies
jest.mock('./checkPlatform');
jest.mock('./findVCVarsAll');
jest.mock('./vcvarsall-enviro-inspector');
jest.mock('./log');
jest.mock('./inputsResolver');
jest.mock('./setOutputs');
jest.mock('./findVisualC');
jest.mock('./updateEnv');

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
  core.clear();
});

describe('main.ts execution flow', () => {
  it('should complete the full flow on Windows with valid inputs', async () => {
    (resolveInputs as jest.Mock).mockReturnValue({
      vsVersion: 'latest',
      architecture: Architecture.x64,
      platformType: null,
      windowsSdkVersion: null,
      toolsetVersion: null,
      spectreMode: false,
      canonicalizePaths: false,
      ifNotWindows: 'fail',
      updateEnv: true,
      debug: false,
    });
    (checkPlatform as jest.Mock).mockReturnValue(true);
    (findVisualC as jest.Mock).mockResolvedValue({path: 'C:/VS/Path'});
    await run();
    expect(checkPlatform).toHaveBeenCalled();
    expect(findVisualC).toHaveBeenCalledWith('latest');
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  it('should call core.setFailed when an error occurs', async () => {
    (resolveInputs as jest.Mock).mockImplementation(() => {
      throw new Error('Configuration error');
    });
    await run();
    expect(core.getFailed()).toEqual(new Error('Configuration error'));
  });

  it('should stop execution if checkPlatform returns false', async () => {
    (resolveInputs as jest.Mock).mockReturnValue({ifNotWindows: 'ignore'});
    (checkPlatform as jest.Mock).mockReturnValue(false);
    await run();
    expect(findVisualC).not.toHaveBeenCalled();
    expect(core.getFailed()).toBeNull();
  });
});
