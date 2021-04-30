import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import serve from 'rollup-plugin-serve'
import pkg from './package.json'

const production = !process.env.ROLLUP_WATCH

export default {
  input: 'src/index.js',
  output: [
    { file: 'docs/build/barnone.js', format: 'es', sourcemap: true },
    // production && { file: pkg.module, format: 'es' },
    production && { file: pkg.main, format: 'umd', name: 'Barnone' }
  ],
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    !production && serve({
      contentBase: 'docs',
      port: 5000
    }),
    !production && livereload('docs'),
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
}
