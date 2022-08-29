import { mkdir, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { loadSync } from 'protobufjs'
import { CommonDefsGenerator } from './generateCommonDefs'
import { ProtoParser } from './parseProtoObj'
import { GrpcTsServerGenerator } from './ServerGenerator'
import { ExportCollector } from './utils'

const makeDir = promisify(mkdir)

interface GenerateOptions {
    protoPaths: string[]
    outDir: string
    generateClient: boolean
    generateServer: boolean
}

export const generate = async ({ protoPaths, outDir, ...opts }: GenerateOptions) => {
    const { generateClient, generateServer } = opts
    const protoRoot = loadSync(protoPaths)

    if (!protoRoot.nested) return

    const outputFileMap: Record<string, string> = {}
    const exportCollector = new ExportCollector()
    const config: Record<string, string> = {}

    const protoParser = new ProtoParser({ protoPaths })
    const defsGenerator = new CommonDefsGenerator({ protoParser, exportCollector, config })

    if (generateServer) {
        const serverGenerator = new GrpcTsServerGenerator({ exportCollector, protoParser })

        outputFileMap['server.d.ts'] = serverGenerator.toTS()
        outputFileMap['server.js'] = serverGenerator.toJS()
    }

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

export { ExportCollector }
