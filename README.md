[![Continuous Integration for dev](https://img.shields.io/github/actions/workflow/status/mlocati/setup-msvc/ci.yml?label=dev)](https://github.com/mlocati/setup-msvc/actions/workflows/ci.yml)
[![Continuous Integration for v1](https://img.shields.io/github/actions/workflow/status/mlocati/setup-msvc/ci.yml?label=v1&branch=v1)](https://github.com/mlocati/setup-msvc/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/mlocati/setup-msvc/badge.svg)](https://coveralls.io/github/mlocati/setup-msvc)

# Setup MSVC GitHub Action

This GitHub Action configures a complete **Microsoft Visual C++ (MSVC)** development environment on Windows by invoking `vcvarsall.bat`.
It automatically detects installed Visual Studio instances, selects the correct toolset, Windows SDK, and architecture, and exposes all environment variables required to build C and C++ projects with MSVC.

## Examples

### Minimal

```yml
steps:
  - name: Setup MSVC
    uses: mlocati/setup-msvc@v1
```

### Full

```yml
steps:
  - name: Setup MSVC
    uses: mlocati/setup-msvc@v1
    id: msvc
    with:
      vs-version: latest
      architecture: x64
      platform-type: store
      windows-sdk-version: 10.0.26100.0
      toolset-version: '14.44'
      spectre-mode: true
      canonicalize-paths: true
      if-not-windows: fail
      update-env: false
      debug: true
  - name: Dump value of INCLUDE detected by by the setup-msvc action
    run: echo "${{ steps.msvc.outputs.include }}$"
```

## Features

- Automatic detection of installed Visual Studio versions
- Support for all MSVC architectures: `x86`, `x64`, `x86_x64`, `x86_arm`, `x86_arm64`, `x64_x86`, `x64_arm`, `x64_arm64`
- Optional selection of:
  - Windows SDK version
  - MSVC toolset version
  - Spectre mitigation mode
  - Platform type (desktop, Store, UWP)
- Outputs all environment variables set by `vcvarsall.bat`
- Updates the environment for all subsequent workflow steps (by default, but it can be disabled)
- Includes a debug mode for troubleshooting
- Fully tested

## Inputs


| Name | Description | Default |
|:---|:---|:---|
| `vs-version` | Visual Studio version (`latest`, `2022`, `17`, …) | `latest` |
| `architecture` | Target architecture for MSVC tools | *detected automatically* |
| `platform-type` | `desktop` (or empty), `store`, or `uwp` | `desktop` |
| `windows-sdk-version` | Windows SDK version | *detected automatically* |
| `toolset-version` | MSVC toolset version | *detected automatically* |
| `spectre-mode` | Enable Spectre mitigation (`true`/`false`) | `false` |
| `canonicalize-paths` | Normalize and verify paths (`true`/`false`) | `false` |
| `if-not-windows` | Behavior on non-Windows runners (`fail`, `warn`, `ignore`) | `fail` |
| `update-env` | Update environment variables for subsequent steps (`true`/`false`) | `true` |
| `debug` | Print debug information (`true`/`false`) | `false` |

## Outputs

| Name | Description | Example |
|:---|:---|:---|
| `vcvarsall-path` | The path of the Visual Studio `vcvarsall.bat` file | `C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat` |
| `path` | The directories added to the `PATH` environment variables by Visual Studio | |
| `include` | The value of the `INCLUDE` environment variable set by Visual Studio | |
| `lib` | The value of the `LIB` environment variable set by Visual Studio | |
| `libpath` | The value of the `LIBPATH` environment variable set by Visual Studio | |
| `vc-installdir` | The value of the `VCINSTALLDIR` environment variable set by Visual Studio | `C:\Program Files\Microsoft Visual Studio\2022\Community\VC\` |
| `vs-installdir` | The value of the `VSINSTALLDIR` environment variable set by Visual Studio | `C:\Program Files\Microsoft Visual Studio\2022\Community\` |
| `vs-version` | The value of the `VisualStudioVersion` environment variable set by Visual Studio | `17.0` |
| `vctools-installdir` | The value of the `VCTOOLSINSTALLDIR` environment variable set by Visual Studio | `C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.44.35207\` |
| `vctools-version` | The value of the `VCTOOLSVERSION` environment variable set by Visual Studio | `14.44.35207` |
| `windows-sdk-dir` | The value of the `WindowsSdkDir` environment variable set by Visual Studio | `C:\Program Files (x86)\Windows Kits\10\` |
| `windows-sdk-version` | The value of the `WindowsSDKVersion` environment variable set by Visual Studio | `10.0.26100.0\` |
| `windows-sdk-lib-version` | The value of the `WindowsSDKLibVersion` environment variable set by Visual Studio | `10.0.26100.0\` |
| `ucrt-version` | The value of the `UCRTVersion` environment variable set by Visual Studio | `10.0.26100.0` |
| `platform` | The value of the `Platform` environment variable set by Visual Studio | `x64` |
| `vcmd-arg-host-arch` | The value of the `VSCMD_ARG_HOST_ARCH` environment variable set by Visual Studio | `x64` |
| `vcmd-arg-tgt-arch` | The value of the `VSCMD_ARG_TGT_ARCH` environment variable set by Visual Studio | `x64` |
| `all` | The value of all the environment variables set by Visual Studio, in JSON format | |