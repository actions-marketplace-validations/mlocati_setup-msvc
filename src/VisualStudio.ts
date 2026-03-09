import {Year, Version2, Version4, extractVersion, compare} from './version';

export type LatestVersion = 'latest';

export interface VisualStudioVersion {
  readonly year: Year;
  readonly version: Version2;
  readonly minVersion: Version4;
  readonly maxVersion: Version4;
}

export const versions: ReadonlyArray<VisualStudioVersion> = [
  {year: '2005', version: '8.0', minVersion: '8.0.0.0', maxVersion: '8.999.999.999'},
  {year: '2008', version: '9.0', minVersion: '9.0.0.0', maxVersion: '9.999.999.999'},
  {year: '2010', version: '10.0', minVersion: '10.0.0.0', maxVersion: '10.999.999.999'},
  {year: '2012', version: '11.0', minVersion: '11.0.0.0', maxVersion: '11.999.999.999'},
  {year: '2013', version: '12.0', minVersion: '12.0.0.0', maxVersion: '12.999.999.999'},
  {year: '2015', version: '14.0', minVersion: '14.0.0.0', maxVersion: '14.999.999.999'},
  {year: '2017', version: '15.0', minVersion: '15.0.0.0', maxVersion: '15.999.999.999'},
  {year: '2019', version: '16.0', minVersion: '16.0.0.0', maxVersion: '16.999.999.999'},
  {year: '2022', version: '17.0', minVersion: '17.0.0.0', maxVersion: '17.999.999.999'},
  {year: '2026', version: '18.0', minVersion: '18.0.0.0', maxVersion: '18.999.999.999'},
];

export function getVisualStudioVersionBySpecificVersion(version: string): VisualStudioVersion | null {
  const version4 = extractVersion(version);
  if (!version4) {
    return null;
  }
  return versions.find((v) => compare(version4, v.minVersion) >= 0 && compare(version4, v.maxVersion) <= 0) ?? null;
}
