import { mkdir, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { loadSync } from 'protobufjs'
import { generateCommonProtoDefs } from './generateCommonDefs'
import { parseFromNestedObj } from './parseProtoObj'

const makeDir = promisify(mkdir)

interface GenerateOptions {
    protoPaths: string[]
    outDir: string
}

export const generate = async ({ protoPaths, outDir }: GenerateOptions) => {
    const protoRoot = loadSync(protoPaths)

    if (!protoRoot.nested) return
    const parsedProto = parseFromNestedObj(protoRoot.nested, new Map())

    const outputFileMap: Record<string, string> = {}

    outputFileMap['index.d.ts'] = generateCommonProtoDefs(parsedProto)
    outputFileMap['package.json'] = JSON.stringify(generatePkgJson(), null, 2)

    outputFileMap['index.js'] = `const parsedDef = \`${JSON.stringify(Array.from(parsedProto), null, 2)}\``

    await makeDir(outDir, { recursive: true })

    Object.entries(outputFileMap).forEach(([fileName, output]) => {
        const path = join(outDir, fileName)

        writeFileSync(path, output)
    })
}

const generatePkgJson = () => ({
    name: '.grpc_ts/output',
    main: 'index.js',
    types: 'index.d.ts',
})
