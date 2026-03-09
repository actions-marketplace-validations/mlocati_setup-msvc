import * as core from '@actions/core';
import * as fsMock from './__mocks__/fs';
import findVCVarsAll from './findVCVarsAll';

jest.mock('node:fs', () => fsMock.mock);

beforeEach(() => {
  core.clear();
  fsMock.clear();
});

describe('findVCVarsAll', () => {
  it('should throw an error if vcvarsall.bat is not found', () => {
    const vcPath = 'C:\\Invalid\\Path';
    expect(() => findVCVarsAll(vcPath)).toThrow(/vcvarsall.bat not found/);
  });

  it('should find vcvarsall.bat in the expected location (syntax 1)', () => {
    const vcPath = 'C:\\Valid\\Path';
    const expectedPath = `${vcPath}\\Auxiliary\\Build\\vcvarsall.bat`;
    fsMock.addMockPath(expectedPath, 'file');
    const actualPath = findVCVarsAll(vcPath);
    expect(actualPath).toBe(expectedPath);
  });

  it('should find vcvarsall.bat in the expected location (syntax 2)', () => {
    const vcPath = 'C:\\Valid\\Path';
    const expectedPath = `${vcPath}\\vcvarsall.bat`;
    fsMock.addMockPath(expectedPath, 'file');
    const actualPath = findVCVarsAll(vcPath);
    expect(actualPath).toBe(expectedPath);
  });
});
