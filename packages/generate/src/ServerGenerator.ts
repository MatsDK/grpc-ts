import { ProtoParser } from './parseProtoObj'
import { ExportCollector, i } from './utils'

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

${i(`listen(url: string, cb?: (error: Error | null, port: number) => void): void`)}

${
            i(`addServiceResolvers<TName extends keyof ServicesMap<TContext>, TResolvers extends ServicesMap<TContext>[TName]>(
${
                i(`serviceName: TName, 
resolvers: TResolvers`)
            }
): GrpcServer<TContext>`)
        }
}

export function createGrpcServer<TContext = {}>(): GrpcServer<TContext>
`
    }

    toJS() {
        this.opts.exportCollector.addExport(
            'JS',
            `module.exports = {
  ...require("./server")
}`,
        )

        return `const { GrpcServer } = require("@grpc-ts/server/src/runtime")
const { config } = require(".")

// exports.GrpcServer = getGrpcServer(config)

exports.createGrpcServer = () => {
  return new GrpcServer(config)
}
`
    }
}
