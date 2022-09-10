import _ from 'lodash'
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
        this.opts.exportCollector.addExport('TS', `export * from "./client"`)

        return `import { grpc_calls } from '.'

export class GrpcClient {
}

export declare function createGrpcClient(): GrpcClient & grpc_calls.ServicesTree
`
    }

    toJS() {
        this.opts.exportCollector.addExport(
            'JS',
            `...require("./client")`,
        )

        return `const { GrpcClient } = require("@grpc-ts/client/src/runtime")
const { config } = require(".")

exports.createGrpcClient = (options) => {
  return new GrpcClient(config, options)
}
`
    }
}
