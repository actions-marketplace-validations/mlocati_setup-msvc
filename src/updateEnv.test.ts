import * as core from '@actions/core';
import updateEnv from './updateEnv';
import {CaseInsensitiveStringMap} from './CaseInsensitiveMap';

const originalEnv = {...process.env};

beforeEach(() => {
  jest.clearAllMocks();
  core.clear();
});

afterEach(() => {
  process.env = {...originalEnv};
});

describe('updateEnv', () => {
  it('should call core.exportVariable', () => {
    const vars = new CaseInsensitiveStringMap([
      ['Path', 'C:\\bin'],
      ['INCLUDE', 'C:\\include'],
      ['Unlisted', 'value'],
    ]);
    const originalPath = 'C:\\Windows\\System32';
    process.env.PATH = originalPath;
    updateEnv(vars);
    const exportedVariables = core.getExportedVariables();
    expect(exportedVariables).toEqual({
      Path: `C:\\bin;${originalPath}`,
      INCLUDE: 'C:\\include',
      Unlisted: 'value',
    });
  });
});
