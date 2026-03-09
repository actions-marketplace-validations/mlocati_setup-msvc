import * as fs from 'node:fs';
import * as path from 'node:path';
import findCommand from './findCommand';
import * as log from './log';

export default async function findVSWhere(): Promise<string> {
  let vsWherePath: string | undefined;
  log.startDebugGroup('Finding vswhere.exe');
  try {
    vsWherePath = await findCommand('vswhere.exe');
  } catch (err) {
    log.debug(
      `Failed to find vswhere.exe with where.exe (${err instanceof Error ? err.message : err}), let's try with some known paths`,
    );
  }
  if (vsWherePath) {
    log.endDebugGroup();
    return vsWherePath;
  }
  const programFilesPaths = [
    process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)',
    process.env['ProgramW6432'] || process.env['ProgramFiles'] || 'C:\\Program Files',
  ];
  for (const programFilesPath of programFilesPaths) {
    const p = path.join(programFilesPath, 'Microsoft Visual Studio', 'Installer', 'vswhere.exe');
    if (!fs.existsSync(p)) {
      log.debug(`vswhere.exe not found at expected location ${p}`);
      continue;
    }
    vsWherePath = fs.realpathSync.native(p);
    break;
  }
  if (!vsWherePath) {
    log.endDebugGroup();
    throw new Error('Unable to find vswhere.exe');
  }
  log.debug(`Found vswhere.exe at ${vsWherePath}`);
  log.endDebugGroup();
  return vsWherePath;
}
