import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

// https://rollupjs.org/configuration-options
const config = {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.js',
    format: 'es',
    generatedCode: 'es2015',
    interop: 'esModule',
    sourcemap: false,
    validate: true,
    esModule: true,
  },
  plugins: [typescript(), nodeResolve({preferBuiltins: true}), commonjs()],
  context: undefined,
  moduleContext: undefined,
  onwarn(warning: {code: string}, handler: (warning: {code: string}) => void) {
    if (warning.code === 'THIS_IS_UNDEFINED' || warning.code === 'CIRCULAR_DEPENDENCY') {
      return;
    }
    handler(warning);
  },
};

export default config;
