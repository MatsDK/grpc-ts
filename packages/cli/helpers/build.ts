import esbuild from 'esbuild'

esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'build/index.js',
    platform: 'node',
})
