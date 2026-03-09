declare module '@actions/core' {
  export function clear(): void;
  export function setInput(name: string, value: string): void;
  export function getLoggedMessages(): string[];
  export function setDebugEnabled(enableDebug: boolean): void;
  export function getFailed(): string | Error | null;
  export function getExportedVariables(): Record<string, string>;
  export function getOutputs(): Record<string, string>;
}
import {type InputOptions} from '@actions/core';
import {jest} from '@jest/globals';

const DEFAULT_ENV: Readonly<Record<string, string>> = {
  'INPUT_VS-VERSION': 'latest',
  INPUT_ARCHITECTURE: '',
  'INPUT_PLATFORM-TYPE': '',
  'INPUT_WINDOWS-SDK-VERSION': '',
  'INPUT_TOOLSET-VERSION': '',
  'INPUT_SPECTRE-MODE': 'false',
  'INPUT_CANONICALIZE-PATHS': 'false',
  'INPUT_IF-NOT-WINDOWS': 'fail',
  'INPUT_UPDATE-ENV': 'true',
  INPUT_DEBUG: 'false',
};
const mockedEnv: Record<string, string> = {};
const loggedMessages: string[] = [];
let debugEnabled = true;
let failedOutcome: string | Error | null = null;
const exportedVariables: Record<string, string> = {};
const outputs: Record<string, string> = {};

function inputNameToEnvVar(name: string): string {
  const key = `INPUT_${name.replace(/ /g, '-').toUpperCase()}`;
  if (!DEFAULT_ENV.hasOwnProperty(key)) {
    throw new Error(`Unknown input: "${name}"`);
  }
  return key;
}

export function clear(): void {
  for (const key in mockedEnv) delete mockedEnv[key];
  loggedMessages.length = 0;
  debugEnabled = true;
  failedOutcome = null;
  for (const key in exportedVariables) delete exportedVariables[key];
  for (const key in outputs) delete outputs[key];
}

export function setInput(name: string, value: string): void {
  mockedEnv[inputNameToEnvVar(name)] = value;
}

export function getLoggedMessages(): string[] {
  return loggedMessages;
}

export function setDebugEnabled(enableDebug: boolean): void {
  debugEnabled = enableDebug;
}

export const getInput = jest.fn((name: string, options?: InputOptions): string => {
  const envVar = inputNameToEnvVar(name);
  let result: string = mockedEnv.hasOwnProperty(envVar) ? mockedEnv[envVar] : DEFAULT_ENV[envVar];
  if (!options || options.trimWhitespace !== false) {
    result = result.trim();
  }
  if (options?.required && !result) {
    throw new Error(`Input required and not supplied: ${name}`);
  }

  return result;
});

export const getBooleanInput = jest.fn((name: string, options?: InputOptions): boolean => {
  const value = getInput(name, options);
  if (['true', 'True', 'TRUE'].includes(value)) {
    return true;
  }
  if (['false', 'False', 'FALSE'].includes(value)) {
    return false;
  }
  throw new Error(`Invalid value for boolean input: ${name}\nReceived: ${value}`);
});

function logMessage(name: string, message?: string | Error): void {
  if (message !== undefined) {
    loggedMessages.push(`${name}: ${message}`);
  } else {
    loggedMessages.push(name);
  }
}
export const debug = jest.fn((message: string): void => {
  if (debugEnabled) {
    logMessage('DEBUG', message);
  }
});

export const info = jest.fn((message: string): void => {
  logMessage('INFO', message);
});

export const notice = jest.fn((message: string | Error): void => {
  logMessage('NOTICE', message);
});

export const warning = jest.fn((message: string | Error): void => {
  logMessage('WARNING', message);
});

export const error = jest.fn((message: string | Error): void => {
  logMessage('ERROR', message);
});

export const startGroup = jest.fn((name: string): void => {
  logMessage('GROUP START', name);
});
export const endGroup = jest.fn((): void => {
  logMessage(`GROUP END`);
});

export const startDebugGroup = jest.fn((name: string): void => {
  if (debugEnabled) {
    logMessage('DEBUG GROUP START', name);
  }
});

export const endDebugGroup = jest.fn((): void => {
  if (debugEnabled) {
    logMessage('DEBUG GROUP END');
  }
});

export const isDebug = jest.fn((): boolean => {
  return debugEnabled;
});

export const setFailed = jest.fn((message: string | Error): void => {
  failedOutcome = message;
});

export function getFailed(): string | Error | null {
  return failedOutcome;
}

export const exportVariable = jest.fn((name: string, value: string): void => {
  exportedVariables[name] = value;
});

export function getExportedVariables(): Record<string, string> {
  return {...exportedVariables};
}

export const setOutput = jest.fn((name: string, value: string): void => {
  outputs[name] = value;
});

export function getOutputs(): Record<string, string> {
  return {...outputs};
}
