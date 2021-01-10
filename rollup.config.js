import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';

export default {
  preserveSymlinks: true,
  input: [ 'animation-fireworks.js' ],
  output: {
    file: 'dist/js/animation-fireworks.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    resolve(),
    babel(),
    terser({
      output: {
        comments: false,
      },
    }),
    copy({
      targets: [{
        src: './demo/css/styles.css',
        dest: './dist/css',
      },{
        src: './demo/index.html',
        dest: './dist',
        transform: (contents) => contents.toString().replace('<script type="module" src="..', '<script type="module" src="js'),
      }],
    }),
  ]
};