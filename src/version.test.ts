import {isVersion2, isVersion4, compare, extractVersion} from './version';

describe('version2', () => {
  it('should validate correct version2 formats', () => {
    expect(isVersion2('1.0')).toBe(true);
    expect(isVersion2('10.20')).toBe(true);
  });
  it('should invalidate incorrect version2 formats', () => {
    expect(isVersion2('')).toBe(false);
    expect(isVersion2('1')).toBe(false);
    expect(isVersion2('1.2.3')).toBe(false);
    expect(isVersion2('1.2.3.4')).toBe(false);
    expect(isVersion2('1.2.3.4.5')).toBe(false);
    expect(isVersion2('abc.def')).toBe(false);
  });
});

describe('version4', () => {
  it('should validate correct version4 formats', () => {
    expect(isVersion4('1.2.3.4')).toBe(true);
    expect(isVersion4('10.20.30.40')).toBe(true);
  });
  it('should invalidate incorrect version4 formats', () => {
    expect(isVersion4('')).toBe(false);
    expect(isVersion4('1')).toBe(false);
    expect(isVersion4('1.2')).toBe(false);
    expect(isVersion4('1.2.3')).toBe(false);
    expect(isVersion4('1.2.3.4.5')).toBe(false);
    expect(isVersion4('abc.def')).toBe(false);
  });
});

describe('compare', () => {
  it('should compare versions correctly', () => {
    expect(compare('16.0.0.0', '16.0.0.0')).toBe(0);
    expect(compare('16.0.999999999.0', '16.0.999999999.0')).toBe(0);
    expect(compare('16.0.0.0', '15.9.0.0')).toBe(1);
    expect(compare('15.9.0.0', '16.0.0.0')).toBe(-1);
    expect(compare('16.0.1.0', '16.0.0.0')).toBe(1);
    expect(compare('16.0.0.0', '16.0.1.0')).toBe(-1);
    expect(compare('16.1.0.0', '16.0.0.0')).toBe(1);
    expect(compare('15.9.0.0', '15.10.0.0')).toBe(-1);
  });
});

describe('extractVersion', () => {
  it('should extract version from string', () => {
    expect(extractVersion('\n1\t')).toBe('1.0.0.0');
    expect(extractVersion('1.2')).toBe('1.2.0.0');
    expect(extractVersion('1.2.3-foo\n')).toBe('1.2.3.0');
    expect(extractVersion('1.2.3.44444')).toBe('1.2.3.44444');
    expect(extractVersion('1.2.3.44444.5')).toBe('1.2.3.44444');
  });
});
