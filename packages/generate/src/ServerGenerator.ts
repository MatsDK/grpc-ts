import { ProtoParser } from './parseProtoObj'
import { ExportCollector, formatName, i } from './utils'

interface GrpcServerGeneratorOptions {
    exportCollector: ExportCollector
    protoParser: ProtoParser
}

export class GrpcTsServerGenerator {
    opts: GrpcServerGeneratorOptions

    constructor(opts: GrpcServerGeneratorOptions) {
        this.opts = opts
    }

    toTS() {
        this.opts.exportCollector.addExport('TS', `export * from "./server"`)

        return `import { ServicesMap } from '.'

export class GrpcServer<TContext> {
${i(`addServiceResolvers<TName extends keyof ServicesMap>(serviceName: TName, resolvers: any): GrpcServer<TContext>`)}
}

declare function createGrpcServer<TContext = {}>(): GrpcServer<TContext>
`
    }

    toJS() {
        this.opts.exportCollector.addExport(
            'JS',
            `module.exports = {
  ...require("./server")
}`,
        )

        return `const { getGrpcServer } = require("@grpc-ts/server/src/runtime")
const { config } = require(".")

exports.GrpcServer = getGrpcServer(config)

exports.createGrpcServer = () => {
  return getGrpcServer(config)
}
`
    }
}
