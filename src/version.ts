type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export type Year = `${Digit}${Digit}${Digit}${Digit}`;

export type Version2 = `${number}.${number}`;

export function isVersion2(s: string): s is Version2 {
  return /^\d+\.\d+$/.test(s);
}

export type Version4 = `${number}.${number}.${number}.${number}`;

export function isVersion4(s: string): s is Version4 {
  return /^\d+\.\d+\.\d+\.\d+$/.test(s);
}

export function compare(a: Version4, b: Version4): -1 | 0 | 1 {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < 4; i++) {
    if (partsA[i] < partsB[i]) return -1;
    if (partsA[i] > partsB[i]) return 1;
  }
  return 0;
}

export function extractVersion(version: string): Version4 | null {
  const versionDigits = version.trim().match(/^\d+(\.\d+){0,3}/)?.[0];
  if (!versionDigits) {
    return null;
  }
  const chunks = versionDigits.split('.');
  while (chunks.length < 4) {
    chunks.push('0');
  }
  return chunks.join('.') as Version4;
}
