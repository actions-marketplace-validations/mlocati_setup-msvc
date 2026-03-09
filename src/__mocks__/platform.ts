const originalPlatform: string = process.platform;
let platformValue: string = originalPlatform;

Object.defineProperty(process, 'platform', {
  get() {
    return platformValue;
  },
});

export const setPlatform = jest.fn((platform: string): void => {
  platformValue = platform;
});

export const restorePlatform = jest.fn((): void => {
  platformValue = originalPlatform;
});

export default {
  setPlatform,
  restorePlatform,
};
