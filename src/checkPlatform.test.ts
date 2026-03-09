import * as core from '@actions/core';
import mockPlatform from './__mocks__/platform';
import checkPlatform, {IfNonWindows} from './checkPlatform';

beforeEach(() => {
  core.clear();
  mockPlatform.restorePlatform();
});

afterEach(() => {
  mockPlatform.restorePlatform();
});

describe('checkPlatform', () => {
  it('should return true on Windows regardless of IfNonWindows value', () => {
    mockPlatform.setPlatform('win32');
    expect(checkPlatform(IfNonWindows.Fail)).toBe(true);
    expect(checkPlatform(IfNonWindows.Warn)).toBe(true);
    expect(checkPlatform(IfNonWindows.Ignore)).toBe(true);
  });

  it('should throw an error on non-Windows when IfNonWindows is Fail', () => {
    mockPlatform.setPlatform('linux');
    expect(() => checkPlatform(IfNonWindows.Fail)).toThrow(
      'This action can only be run on Windows (current platform: linux)',
    );
  });

  it('should log a warning and return false on non-Windows when IfNonWindows is Warn', () => {
    mockPlatform.setPlatform('darwin');
    expect(checkPlatform(IfNonWindows.Warn)).toBe(false);
    expect(core.getLoggedMessages()).toContain(
      `WARNING: This action can only be run on Windows (current platform: darwin)`,
    );
  });

  it('should return false on non-Windows when IfNonWindows is Ignore', () => {
    mockPlatform.setPlatform('linux');
    expect(checkPlatform(IfNonWindows.Ignore)).toBe(false);
  });
});
