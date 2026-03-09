import {compare, extractVersion} from './version';
import {versions, getVisualStudioVersionBySpecificVersion} from './VisualStudio';

describe('Visual Studio versions', () => {
  it('should have correct versions', () => {
    expect(versions).toContainEqual({
      year: '2022',
      version: '17.0',
      minVersion: '17.0.0.0',
      maxVersion: '17.999.999.999',
    });
  });
  it('should not overlap versions', () => {
    for (let i = 0; i < versions.length - 1; i++) {
      const current = versions[i];
      const next = versions[i + 1];
      expect(compare(current.maxVersion, next.minVersion)).toBeLessThan(0);
    }
  });
  it.each(versions)('should define valid min/max versions', (v) => {
    expect(compare(v.minVersion, v.maxVersion)).toBeLessThanOrEqual(0);
  });
  it.each(versions)('should define valid base versions', (v) => {
    const vBase = extractVersion(v.version);
    expect(compare(vBase, v.minVersion)).toBe(0);
  });
});

describe('getVisualStudioVersionBySpecificVersion', () => {
  it('should return correct version for specific version', () => {
    expect(getVisualStudioVersionBySpecificVersion('')).toBeNull();
    expect(getVisualStudioVersionBySpecificVersion('invalid')).toBeNull();
    expect(getVisualStudioVersionBySpecificVersion('17.0')).toEqual({
      year: '2022',
      version: '17.0',
      minVersion: '17.0.0.0',
      maxVersion: '17.999.999.999',
    });
    expect(getVisualStudioVersionBySpecificVersion('17.1')).toEqual({
      year: '2022',
      version: '17.0',
      minVersion: '17.0.0.0',
      maxVersion: '17.999.999.999',
    });
  });
});
