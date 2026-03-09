import * as fs from 'node:fs';
import * as path from 'node:path';
import * as log from './log';

export default function findVCVarsAll(vcPath: string): string {
  const tryPaths = [path.join(vcPath, 'Auxiliary', 'Build', 'vcvarsall.bat'), path.join(vcPath, 'vcvarsall.bat')];
  for (const tryPath of tryPaths) {
    if (fs.existsSync(tryPath) && fs.statSync(tryPath).isFile()) {
      const realPath = fs.realpathSync.native(tryPath);
      log.debug(`vcvarsall.bat found at: ${realPath}`);
      return realPath;
    }
  }
  throw new Error(`vcvarsall.bat not found in Visual C++ installation at: ${vcPath}`);
}
