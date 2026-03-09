import * as core from '@actions/core';
import {CaseInsensitiveStringMap} from './CaseInsensitiveMap';

export default function updateEnv(vars: CaseInsensitiveStringMap): void {
  for (const [key, value] of vars) {
    switch (key.toUpperCase()) {
      case 'PATH':
        const currentPath = process.env.PATH!;
        core.exportVariable(key, `${value};${currentPath}`);
        break;
      default:
        core.exportVariable(key, value);
        break;
    }
  }
}
