import * as core from '@actions/core';
import setOutputs from './setOutputs';
import {CaseInsensitiveStringMap} from './CaseInsensitiveMap';

beforeEach(() => {
  jest.clearAllMocks();
  core.clear();
});

describe('setOutputs', () => {
  it('should call core.setOutput', () => {
    const vcVarsAllPath = 'C:\\Path\\To\\vcvarsall.bat';
    const path = 'C:\\bin';
    const include = 'C:\\include';
    const vars = new CaseInsensitiveStringMap([
      ['Path', path],
      ['INCLUDE', include],
      ['Unlisted', 'value'],
    ]);

    setOutputs(vcVarsAllPath, vars);

    const outputs = core.getOutputs();
    const all = outputs.all ? JSON.parse(outputs.all) : {};
    delete outputs['all'];
    expect(outputs).toEqual({
      'vcvarsall-path': vcVarsAllPath,
      path: path,
      include: include,
      lib: '',
      libpath: '',
      'vc-installdir': '',
      'vs-installdir': '',
      'vs-version': '',
      'vctools-installdir': '',
      'vctools-version': '',
      'windows-sdk-dir': '',
      'windows-sdk-version': '',
      'windows-sdk-lib-version': '',
      'ucrt-version': '',
      platform: '',
      'vcmd-arg-tgt-arch': '',
      'vcmd-arg-host-arch': '',
    });
    expect(all).toEqual({
      Path: path,
      INCLUDE: include,
      Unlisted: 'value',
    });
  });
});
