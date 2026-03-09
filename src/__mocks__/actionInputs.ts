class InputDefinition {
  readonly name: string;
  readonly required: boolean;
  readonly defaultValue: string;
  readonly envName: string;
  constructor(name: string, required: boolean = false, defaultValue: string = '') {
    if (required && defaultValue) {
      throw new Error(`Input cannot be required and have a default value: ${name}`);
    }
    this.name = name;
    this.required = required;
    this.defaultValue = defaultValue;
    this.envName = `INPUT_${name.toUpperCase().replace(/ /g, '_')}`;
  }
}

const inputDefinitions: ReadonlyArray<InputDefinition> = [
  new InputDefinition('vs-version', false, 'latest'),
  new InputDefinition('architecture', false, ''),
  new InputDefinition('platform-type', false, ''),
  new InputDefinition('windows-sdk-version', false, ''),
  new InputDefinition('toolset-version', false, ''),
  new InputDefinition('spectre-mode', false, 'false'),
  new InputDefinition('canonicalize-paths', false, 'false'),
  new InputDefinition('if-not-windows', false, 'fail'),
  new InputDefinition('update-env', false, 'true'),
  new InputDefinition('debug', false, 'false'),
];

const originalValues: Readonly<Record<string, string | undefined>> = inputDefinitions.reduce(
  (acc, def) => {
    acc[def.envName] = process.env[def.envName];
    return acc;
  },
  {} as Record<string, string | undefined>,
);

export function setInputs(inputs: Partial<Record<string, string>>): void {
  Object.keys(inputs).forEach((key) => {
    if (!inputDefinitions.some((def) => def.name === key)) {
      throw new Error(`Unknown input: ${key}`);
    }
  });
  for (const def of inputDefinitions) {
    if (def.name in inputs) {
      process.env[def.envName] = inputs[def.name];
    } else {
      process.env[def.envName] = def.defaultValue;
    }
  }
}

export function resetInputs(): void {
  for (const def of inputDefinitions) {
    if (originalValues[def.envName] === undefined) {
      delete process.env[def.envName];
    } else {
      process.env[def.envName] = originalValues[def.envName]!;
    }
  }
}
