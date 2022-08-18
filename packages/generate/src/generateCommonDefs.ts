import { ProtoParser } from './parseProtoObj'
import { ExportCollector, i } from './utils'

interface CommonDefsGeneratorOptions {
    protoParser: ProtoParser
    exportCollector: ExportCollector
}

export class CommonDefsGenerator {
    readonly protoParser: ProtoParser
    readonly exportCollector: ExportCollector

    constructor(readonly options: CommonDefsGeneratorOptions) {
        this.protoParser = options.protoParser
        this.exportCollector = options.exportCollector
    }

    toTS() {
        const { parsed } = this.protoParser

        return `${defaultGrpcTSDefs()}
${parsed.toTS(this.protoParser)}
${this.exportCollector.tsExports.join('\n')}
`
    }

    toJS() {
        return `
const parsedDefString = \`${JSON.stringify(this.protoParser.parsed, null, 2)}\`
const parsedDef = JSON.parse(parsedDefString)

export const config = {
    parsedDef
}
${this.exportCollector.jsExports.join('\n')}
`
    }
}

const defaultGrpcTSDefs = () =>
    `declare namespace grpc_ts {

${
        i(`type Stream<T> = { 
${i(`inner: T`)}
}`)
    }

}`
