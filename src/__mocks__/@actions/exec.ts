declare module '@actions/exec' {
  export function clear(): void;
  export function addExecResult(value: ExecResult): void;
}

interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

const execResults: ExecResult[] = [];

export function clear(): void {
  execResults.length = 0;
}

export function addExecResult(value: ExecResult): void {
  execResults.push(value);
}

export const exec = jest.fn(async (commandLine: string, args?: string[], options?: any): Promise<number> => {
  const result = execResults.shift();
  if (!result) {
    throw new Error('No more exec results available');
  }
  if (options?.listeners?.stdout) {
    options.listeners.stdout(Buffer.from(result.stdout));
  }
  if (options?.listeners?.stderr) {
    options.listeners.stderr(Buffer.from(result.stderr));
  }
  if (result.exitCode !== 0 && !options?.ignoreReturnCode) {
    throw new Error(`Command failed with exit code ${result.exitCode}`);
  }
  return result.exitCode;
});
