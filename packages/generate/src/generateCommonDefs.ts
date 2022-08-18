import { ProtoParser } from './parseProtoObj'
import { i } from './utils'

interface CommonDefsGeneratorOptions {
    protoParser: ProtoParser
}

export class CommonDefsGenerator {
    readonly protoParser: ProtoParser

    constructor(readonly options: CommonDefsGeneratorOptions) {
        this.protoParser = options.protoParser
    }

    toTS() {
        const { parsed } = this.protoParser

        return `${defaultGrpcTSDefs()}
${parsed.toTS(this.protoParser)}
`
    }

    toJS() {
        return `const parsedDef = \`${JSON.stringify(this.protoParser.parsed, null, 2)}\``
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
