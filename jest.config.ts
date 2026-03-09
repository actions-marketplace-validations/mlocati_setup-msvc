import type {Config} from 'jest';

process.env.SETUP_MSVC_TESTING = 'true';

// https://jestjs.io/docs/configuration
export default async (): Promise<Config> => {
  return {
    automock: false,
    testEnvironment: 'node',
    testMatch: ['<rootDir>/src/**/*.test.ts'],
    preset: 'ts-jest',
    collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts'],
    moduleNameMapper: {
      '^@actions/core$': '<rootDir>/src/__mocks__/@actions/core.ts',
    },
  };
};
