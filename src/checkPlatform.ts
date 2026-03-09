import * as log from './log';

export enum IfNonWindows {
  Fail = 'fail',
  Warn = 'warn',
  Ignore = 'ignore',
}

export default function checkPlatform(ifNonWindows: IfNonWindows): boolean {
  if (process.platform === 'win32') {
    return true;
  }
  switch (ifNonWindows) {
    case IfNonWindows.Fail:
      throw new Error(`This action can only be run on Windows (current platform: ${process.platform})`);
    case IfNonWindows.Warn:
      log.warning(`This action can only be run on Windows (current platform: ${process.platform})`);
      return false;
    case IfNonWindows.Ignore:
      return false;
  }
}
