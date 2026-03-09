import * as fs from 'node:fs';
import * as path from 'node:path';
import * as log from './log';
import run, {Result as RunResult} from './runner';

let whereExePath: string | undefined;

/**
 * Get the absolute path to where.exe
 * @throws Error if where.exe cannot be found
 */
function getWhereExePath(): string {
  if (typeof whereExePath === 'string') {
    return whereExePath;
  }
  const p = path.join(process.env.SystemRoot || process.env.windir || 'C:\\Windows', 'System32', 'where.exe');
  if (fs.existsSync(p) && fs.statSync(p).isFile()) {
    whereExePath = fs.realpathSync.native(p);
    return whereExePath;
  }
  throw new Error(`where.exe not found at expected location: ${p}`);
}

/**
 * Find the absolute path to a command in the system PATH environment variable using where.exe
 * @param command The name of the command to find (eg vswhere, vswhere.exe, script.bat, ...)
 * @throws Error if the command cannot be found
 * @returns The absolute path to the command
 */
export default async function findCommand(command: string): Promise<string> {
  const whereExe = getWhereExePath();
  const tmpDir = fs.mkdtempSync('ivs-');
  let result: RunResult;
  try {
    result = await run(`"${whereExe}"`, [`"${command}"`], {
      cwd: tmpDir,
    });
  } finally {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  }
  if (result.exitCode === 0) {
    let found = result.stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.toUpperCase().includes(command.toUpperCase()))[0];
    if (found) {
      found = fs.realpathSync.native(found);
      log.debug(`${command} found by where.exe at ${found}`);
      return found;
    }
  }
  log.debug(
    `where.exe exited with code ${result.exitCode} and did not find ${command}. stdout: ${result.stdout}, stderr: ${result.stderr}`,
  );
  throw new Error(`Unable to find ${command}`);
}

export const _testInternals =
  process.env.SETUP_MSVC_TESTING === 'true'
    ? Object.defineProperties(
        {
          getWhereExePath,
        },
        {
          whereExePath: {
            get: (): string | undefined => {
              if (process.env.SETUP_MSVC_TESTING === 'true') {
                return whereExePath;
              }
            },
            set: (value: string | undefined) => {
              if (process.env.SETUP_MSVC_TESTING === 'true') {
                whereExePath = value;
              }
            },
          },
        },
      )
    : undefined;
