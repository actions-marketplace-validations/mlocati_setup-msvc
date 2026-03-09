import * as core from '@actions/core';
import checkPlatform from './checkPlatform';
import findVCVarsAll from './findVCVarsAll';
import {inspectVCVarsAllEnvironmentVariables} from './vcvarsall-enviro-inspector';
import * as log from './log';
import resolveInputs from './inputsResolver';
import setOutputs from './setOutputs';
import findVisualC from './findVisualC';
import updateEnv from './updateEnv';

export async function run(): Promise<void> {
  try {
    const inputs = resolveInputs();
    log.setDebug(inputs.debug);
    if (checkPlatform(inputs.ifNotWindows) === false) {
      return;
    }
    const vc = await findVisualC(inputs.vsVersion);
    const vcVarsAllPath = await findVCVarsAll(vc.path);
    const vars = await inspectVCVarsAllEnvironmentVariables(inputs, vcVarsAllPath);
    setOutputs(vcVarsAllPath, vars);
    if (inputs.updateEnv) {
      updateEnv(vars);
    }
  } catch (error: Error | unknown) {
    core.setFailed(error instanceof Error ? error : String(error));
  }
}

if (process.env.SETUP_MSVC_TESTING !== 'true') {
  /* istanbul ignore next */
  run();
}
