import { mkdir, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { loadSync } from 'protobufjs'
import { CommonDefsGenerator } from './generateCommonDefs'
import { ProtoParser } from './parseProtoObj'

const makeDir = promisify(mkdir)

interface GenerateOptions {
    protoPaths: string[]
    outDir: string
}

export const generate = async ({ protoPaths, outDir }: GenerateOptions) => {
    const protoRoot = loadSync(protoPaths)

    if (!protoRoot.nested) return

    const protoParser = new ProtoParser()
    const parsedProto = protoParser.parseObj(protoPaths)!
    const defsGenerator = new CommonDefsGenerator({ parsedProto })

    const outputFileMap: Record<string, string> = {}

    outputFileMap['index.d.ts'] = defsGenerator.toTS()
    outputFileMap['index.js'] = defsGenerator.toJS()
    outputFileMap['package.json'] = JSON.stringify(generatePkgJson(), null, 2)

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
