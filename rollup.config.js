import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
    // Browser build
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/browser/bundle.js',
            format: 'iife',
            name: 'htmlToSMD' // Replace with your library's name
        },
        plugins: [
            typescript({ tsconfig: './tsconfig.browser.json' }),
            resolve(),
            commonjs()
        ]
    },
    // Node.js build
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/node/index.js',
            format: 'cjs'
        },
        plugins: [
            typescript({ tsconfig: './tsconfig.node.json' }),
            resolve(),
            commonjs()
        ]
    }
];
