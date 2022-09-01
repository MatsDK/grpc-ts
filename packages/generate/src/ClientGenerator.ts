import { ProtoParser } from './parseProtoObj'
import { ExportCollector, i } from './utils'

interface GrpcClientGeneratorOptions {
    exportCollector: ExportCollector
    protoParser: ProtoParser
}

export class GrpcTsClientGenerator {
    opts: GrpcClientGeneratorOptions

    constructor(opts: GrpcClientGeneratorOptions) {
        this.opts = opts
    }

    toTS() {
        return `import { ServicesMap } from '.'

export class GrpcClient {

}

export declare function createGrpcClient(): GrpcClient
`
    }

    toJS() {
        return `const { GrpcClient } = require("@grpc-ts/client/src/runtime")
const { config } = require(".")

exports.createGrpcClient = (options) => {
  return new GrpcClient(config, options)
}
`
    }
}
