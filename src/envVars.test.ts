import * as core from '@actions/core';
import * as fsMock from './__mocks__/fs';
import {CaseInsensitiveStringMap} from './CaseInsensitiveMap';
import {parseSetOutput, computeEnvDelta, canonicalizePaths, _testInternals} from './envVars';

jest.mock('node:fs', () => fsMock.mock);

beforeEach(() => {
  core.clear();
  fsMock.clear();
  fsMock.addMockPath('C:\\', 'dir');
  fsMock.addMockPath('D:\\', 'dir');
  fsMock.addMockPath('C:\\Existing Path with Spaces', 'dir');
  fsMock.addMockPath('C:\\ExistingPathWithoutSpaces', 'dir');
  fsMock.addMockPath('Z:\\Not Existing Path 1', false);
  fsMock.addMockPath('Z:\\Not Existing Path 2', false);
  fsMock.addMockPath('Z:\\Not Existing Path 3', false);
});

describe('envNameNormalizer', () => {
  const envNameNormalizer = _testInternals?.envNameNormalizer;
  if (!envNameNormalizer) {
    throw new Error('envNameNormalizer is not available for testing');
  }

  it('should normalize environment variable names correctly', () => {
    expect(envNameNormalizer('PATH')).toBe('PATH');
    expect(envNameNormalizer('Path')).toBe('PATH');
    expect(envNameNormalizer('path')).toBe('PATH');
    expect(envNameNormalizer('PaTh')).toBe('PATH');
    expect(envNameNormalizer('OTHER_VAR')).toBe('OTHER_VAR');
  });
});

describe('singlePathChecker', () => {
  const singlePathChecker = _testInternals?.singlePathChecker;
  if (!singlePathChecker) {
    throw new Error('singlePathChecker is not available for testing');
  }

  it('should identify single path environment variables correctly', () => {
    expect(singlePathChecker.test('devenvdir')).toBe(true);
    expect(singlePathChecker.test('DEVENVDIR')).toBe(true);
    expect(singlePathChecker.test('DevEnvDir')).toBe(true);
    expect(singlePathChecker.test('frAMEworkdir')).toBe(true);
    expect(singlePathChecker.test('frAMEworkdir32')).toBe(true);
    expect(singlePathChecker.test('frAMEworkdir64')).toBe(true);
    expect(singlePathChecker.test('frAMEworkdir50')).toBe(false);
    expect(singlePathChecker.test('FOO')).toBe(false);
    expect(singlePathChecker.test('PATH')).toBe(false);
  });
});

describe('multiPathChecker', () => {
  const multiPathChecker = _testInternals?.multiPathChecker;
  if (!multiPathChecker) {
    throw new Error('multiPathChecker is not available for testing');
  }

  it('should identify multi path environment variables correctly', () => {
    expect(multiPathChecker.test('PATH')).toBe(true);
    expect(multiPathChecker.test('Path')).toBe(true);
    expect(multiPathChecker.test('path')).toBe(true);
    expect(multiPathChecker.test('pATH')).toBe(true);
    expect(multiPathChecker.test('INCLUDE')).toBe(true);
    expect(multiPathChecker.test('LIB')).toBe(true);
    expect(multiPathChecker.test('libPath')).toBe(true);
    expect(multiPathChecker.test('devenvdir')).toBe(false);
    expect(multiPathChecker.test('DevEnvDir')).toBe(false);
    expect(multiPathChecker.test('FOO')).toBe(false);
  });
});

describe('pathsAreSame', () => {
  const pathsAreSame = _testInternals?.pathsAreSame;
  if (!pathsAreSame) {
    throw new Error('pathsAreSame is not available for testing');
  }

  it('should compare paths correctly', () => {
    expect(pathsAreSame('C:\\Existing Path with Spaces', 'C:\\Existing Path with Spaces')).toBe(true);
    expect(pathsAreSame('C:\\Existing Path with Spaces', 'C:\\Existing Path with Spaces\\')).toBe(true);
    expect(pathsAreSame('C:\\Existing Path with Spaces', 'C:/Existing Path with Spaces')).toBe(true);
    expect(pathsAreSame('C:\\Existing Path with Spaces', 'C:/Existing Path with Spaces/')).toBe(true);
    expect(pathsAreSame('C:\\Existing Path with Spaces', 'C:/Existing Path with Spaces//////')).toBe(true);
    expect(pathsAreSame('C:\\Existing Path with Spaces', 'D:\\Existing Path with Spaces')).toBe(false);
    expect(pathsAreSame('C:\\Existing Path with Spaces', 'C:\\ExistingPathWithoutSpaces')).toBe(false);
    expect(pathsAreSame('C:\\', 'c:/')).toBe(true);
    expect(pathsAreSame('//server/path', '//SERVER/Path')).toBe(true);
  });
});

describe('canonicalizePath', () => {
  const canonicalizePath = _testInternals?.canonicalizePath;
  if (!canonicalizePath) {
    throw new Error('canonicalizePath is not available for testing');
  }

  it('should canonicalize paths correctly', () => {
    expect(canonicalizePath('C:\\Existing Path with Spaces')).toBe('C:\\Existing Path with Spaces');
    expect(canonicalizePath('C:\\Existing Path with Spaces\\')).toBe('C:\\Existing Path with Spaces');
    expect(canonicalizePath('C:\\existing path with spaces\\')).toBe('C:\\Existing Path with Spaces');
    expect(canonicalizePath('c:\\eXISTING pATH WITH sPACES\\')).toBe('C:\\Existing Path with Spaces');
    expect(canonicalizePath('C:/Existing Path with Spaces')).toBe('C:\\Existing Path with Spaces');
    expect(canonicalizePath('C:/Existing Path with Spaces/')).toBe('C:\\Existing Path with Spaces');
    expect(canonicalizePath('C:/Existing Path with Spaces//////')).toBe('C:\\Existing Path with Spaces');
    expect(canonicalizePath('C:\\ExistingPathWithoutSpaces')).toBe('C:\\ExistingPathWithoutSpaces');
    expect(canonicalizePath('C:\\')).toBe('C:\\');
    expect(canonicalizePath('c:/')).toBe('C:\\');
  });
});

describe('parseSetOutput', () => {
  it('should parse multiple lines correctly', () => {
    const actual = parseSetOutput(`VAR1=Value1\r\nVAR2=Value2\nVAR3=Value3\nVAR4=Value4\r`);
    const expected = new CaseInsensitiveStringMap([
      ['VAR1', 'Value1'],
      ['VAR2', 'Value2'],
      ['VAR3', 'Value3'],
      ['VAR4', 'Value4'],
    ]);
    expect(actual).toEqual(expected);
  });
  it('should parse set output correctly', () => {
    const actual = parseSetOutput(`VAR1=Value1\r\nVar1=Value2\r\nvAR1=Value3`);
    const expected = new CaseInsensitiveStringMap([['VAR1', 'Value3']]);
    expect(actual).toEqual(expected);
  });

  it('should handle empty lines and values with spaces', () => {
    const actual = parseSetOutput(`VAR1= Value1 \r\n\r\nVAR2= Value2 \r\n VAR3= Value3 \r\n`);
    const expected = new CaseInsensitiveStringMap([
      ['VAR1', ' Value1 '],
      ['VAR2', ' Value2 '],
      ['VAR3', ' Value3 '],
    ]);
    expect(actual).toEqual(expected);
  });

  it('should handle values with equals signs', () => {
    const actual = parseSetOutput(`VAR1=Value=1\r\nVAR2=Value=2\r\nVAR3=Value=3\r\n`);
    const expected = new CaseInsensitiveStringMap([
      ['VAR1', 'Value=1'],
      ['VAR2', 'Value=2'],
      ['VAR3', 'Value=3'],
    ]);
    expect(actual).toEqual(expected);
  });

  it('should ignore invalid lines', () => {
    const actual = parseSetOutput(
      ['VAR1=Value1', '=Value2', 'VAR3', '=Value4', '', ' ', ' =', 'FINAL=end', ''].join('\r\n'),
    );
    const expected = new CaseInsensitiveStringMap([
      ['VAR1', 'Value1'],
      ['FINAL', 'end'],
    ]);
    expect(actual).toEqual(expected);
  });
});

describe('computeEnvDelta', () => {
  it('should compute environment variable delta correctly', () => {
    const before = new CaseInsensitiveStringMap([
      ['OnlyBefore', 'OnlyBeforeValue'],
      ['Unchanged', 'UnchangedValue'],
      ['Changed', 'ChangedValueBefore'],
    ]);
    const after = new CaseInsensitiveStringMap([
      ['uNCHANGED', 'UnchangedValue'],
      ['Changed', 'ChangedValueAfter'],
      ['OnlyAfter', 'OnlyAfterValue'],
    ]);
    const actual = computeEnvDelta(before, after);
    const expected = new CaseInsensitiveStringMap([
      ['Changed', 'ChangedValueAfter'],
      ['OnlyAfter', 'OnlyAfterValue'],
    ]);
    expect(actual).toEqual(expected);
  });

  it('should return an empty delta when there are no changes', () => {
    const before = new CaseInsensitiveStringMap([
      ['VAR1', 'Value1'],
      ['VAR2', 'Value2'],
    ]);
    const after = new CaseInsensitiveStringMap([
      ['var1', 'Value1'],
      ['var2', 'Value2'],
    ]);
    const actual = computeEnvDelta(before, after);
    const expected = new CaseInsensitiveStringMap();
    expect(actual).toEqual(expected);
  });

  it('should handle an empty before environment', () => {
    const before = new CaseInsensitiveStringMap();
    const after = new CaseInsensitiveStringMap([
      ['VAR1', 'Value1'],
      ['VAR2', 'Value2'],
    ]);
    const actual = computeEnvDelta(before, after);
    const expected = new CaseInsensitiveStringMap([
      ['VAR1', 'Value1'],
      ['VAR2', 'Value2'],
    ]);
    expect(actual).toEqual(expected);
  });

  it('should handle an empty after environment', () => {
    const before = new CaseInsensitiveStringMap([
      ['VAR1', 'Value1'],
      ['VAR2', 'Value2'],
    ]);
    const after = new CaseInsensitiveStringMap();
    const actual = computeEnvDelta(before, after);
    const expected = new CaseInsensitiveStringMap();
    expect(actual).toEqual(expected);
  });

  it('should handle single paths correctly', () => {
    const before = new CaseInsensitiveStringMap([['DEVENVDIR', 'C:\\OldPath']]);
    const after = new CaseInsensitiveStringMap([['DEVENVDIR', 'C:\\NewPath']]);
    const actual = computeEnvDelta(before, after);
    const expected = new CaseInsensitiveStringMap([['DEVENVDIR', 'C:\\NewPath']]);
    expect(actual).toEqual(expected);
  });

  it('should handle multi paths correctly', () => {
    const before = new CaseInsensitiveStringMap([
      ['PATH', 'C:\\OnlyBefore1;C:\\Both1;C:\\OnlyBefore2\\;C:\\Both2'],
      ['INCLUDE', 'C:\\Both1;C:\\Both2'],
    ]);
    const after = new CaseInsensitiveStringMap([
      ['PATH', 'C:\\OnlyAfter1;C:\\Both1;C:\\OnlyAfter2\\;C:\\Both2'],
      ['INCLUDE', 'C:\\Both2;C:\\Both1'],
    ]);
    const actual = computeEnvDelta(before, after);
    const expected = new CaseInsensitiveStringMap([['PATH', 'C:\\OnlyAfter1;C:\\OnlyAfter2\\']]);
    expect(actual).toEqual(expected);
  });
});

describe('canonicalizePaths', () => {
  it('should canonicalize paths in environment variables correctly', () => {
    const input = new CaseInsensitiveStringMap([
      ['DEVENVDIR', 'C:\\Existing Path with Spaces\\'],
      [
        'PATH',
        ';z:\\Not Existing Path 1\\;c:\\eXiStInG pAtH WiTh SpAcEs\\;;z:\\Not Existing Path 2\\;c:\\EXISTING path with SPACES\\;z:\\Not Existing Path 3\\',
      ],
      ['INCLUDE', ''],
      ['OTHER_VAR', 'SomeValue'],
    ]);
    const actual = canonicalizePaths(input);
    const expected = new CaseInsensitiveStringMap([
      ['DEVENVDIR', 'C:\\Existing Path with Spaces'],
      [
        'PATH',
        'z:\\Not Existing Path 1\\;C:\\Existing Path with Spaces;z:\\Not Existing Path 2\\;z:\\Not Existing Path 3\\',
      ],
      ['OTHER_VAR', 'SomeValue'],
    ]);
    expect(actual).toEqual(expected);
  });
});
