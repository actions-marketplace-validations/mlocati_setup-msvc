import * as core from '@actions/core';
import {CaseInsensitiveStringMap} from './CaseInsensitiveMap';

export default function setOutputs(vcVarsAllPath: string, vars: CaseInsensitiveStringMap): void {
  core.setOutput('vcvarsall-path', vcVarsAllPath);
  core.setOutput('path', vars.get('Path') ?? '');
  core.setOutput('include', vars.get('INCLUDE') ?? '');
  core.setOutput('lib', vars.get('LIB') ?? '');
  core.setOutput('libpath', vars.get('LIBPATH') ?? '');
  core.setOutput('vc-installdir', vars.get('VCINSTALLDIR') ?? '');
  core.setOutput('vs-installdir', vars.get('VSINSTALLDIR') ?? '');
  core.setOutput('vs-version', vars.get('VisualStudioVersion') ?? '');
  core.setOutput('vctools-installdir', vars.get('VCTOOLSINSTALLDIR') ?? '');
  core.setOutput('vctools-version', vars.get('VCTOOLSVERSION') ?? '');
  core.setOutput('windows-sdk-dir', vars.get('WindowsSdkDir') ?? '');
  core.setOutput('windows-sdk-version', vars.get('WindowsSDKVersion') ?? '');
  core.setOutput('windows-sdk-lib-version', vars.get('WindowsSDKLibVersion') ?? '');
  core.setOutput('ucrt-version', vars.get('UCRTVersion') ?? '');
  core.setOutput('platform', vars.get('Platform') ?? '');
  core.setOutput('vcmd-arg-host-arch', vars.get('VSCMD_ARG_HOST_ARCH') ?? '');
  core.setOutput('vcmd-arg-tgt-arch', vars.get('VSCMD_ARG_TGT_ARCH') ?? '');
  core.setOutput('all', JSON.stringify(Object.fromEntries(vars.entries())));
}
