import * as exec from '@actions/exec';
import * as core from '@actions/core';
import run from './runner';

jest.mock('@actions/exec');

beforeEach(() => {
  jest.clearAllMocks();
  core.clear();
  exec.clear();
});

describe('runner.ts', () => {
  it('should capture stdout, stderr and exit code correctly', async () => {
    exec.addExecResult({
      stdout: 'hello world',
      stderr: 'some error',
      exitCode: 0,
    });
    const result = await run('hello', ['world'], {cwd: './'});
    expect(result).toEqual({
      stdout: 'hello world',
      stderr: 'some error',
      exitCode: 0,
    });
    // Verify log was called
    expect(core.getLoggedMessages()).toContain('DEBUG: Running hello with arguments ["world"]');
  });

  it.each([false, true])('should respect the throwIfNonZeroExitCode option', async (throwIfNonZeroExitCode) => {
    exec.addExecResult({
      stdout: '',
      stderr: 'error occurred',
      exitCode: 1,
    });
    if (throwIfNonZeroExitCode) {
      expect(async () => await run('failing', ['command'], {throwIfNonZeroExitCode})).rejects.toThrow(
        'Command failed with exit code 1',
      );
    } else {
      const result = await run('cmd', [], {throwIfNonZeroExitCode: false});
      expect(result).toEqual({
        stdout: '',
        stderr: 'error occurred',
        exitCode: 1,
      });
    }
  });

  it('should handle custom environment variables', async () => {
    exec.addExecResult({
      stdout: 'ok',
      stderr: '',
      exitCode: 0,
    });
    const customEnv = {MY_VAR: 'test'};
    await run('cmd', undefined, {env: customEnv});
    expect(exec.exec).toHaveBeenCalledWith('cmd', undefined, expect.objectContaining({env: customEnv}));
  });
});
