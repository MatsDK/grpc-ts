import { ProtoParser } from './parseProtoObj'
import { i } from './utils'
import { ExportCollector } from './utils'

interface CommonDefsGeneratorOptions {
    protoParser: ProtoParser
    exportCollector: ExportCollector
    config: Record<string, string>
}

export class CommonDefsGenerator {
    readonly protoParser: ProtoParser
    readonly exportCollector: ExportCollector

    configExport: Record<string, string>

    constructor(readonly options: CommonDefsGeneratorOptions) {
        this.protoParser = options.protoParser
        this.exportCollector = options.exportCollector
        this.configExport = options.config
    }

    toTS() {
        const { parsed, services } = this.protoParser

        let serviceMapFields = ``
        if (Object.entries(services).length) {
            serviceMapFields = `
${
                Object.entries(services).map(([servicePath, service]) => {
                    return i(`'${servicePath}': ${service.fullName}<TContext>`)
                }).join('\n')
            }
`
        }

        return `${defaultGrpcTSDefs()}

// -------------- Messages/Enums --------------
${parsed.toTS(this.protoParser)}

// -------------- Services --------------
${
            Object.values(services).map((service) => {
                return service.toTS(this.protoParser)
            }).join('\n\n')
        }
// Services Map
export type ServicesMap<TContext = {}> = {${serviceMapFields}}

${this.exportCollector.tsExports.join('\n')}
`
    }

    toJS() {
        this.configExport['serviceDocument'] = `JSON.parse(serviceDefsString)`
        this.configExport['protoPaths'] = `${JSON.stringify(this.protoParser.protoPaths)}`

        console.log(this.protoParser.services)
        return `const serviceDefsString = \`${JSON.stringify(this.protoParser.services, null, 2)}\`

exports.config = {
${
            Object.entries(this.configExport).map(([key, value]) => {
                return `  ${key}: ${value}`
            }).join(',\n')
        }
}
${this.exportCollector.jsExports.join('\n')}
`
    }
}

const defaultGrpcTSDefs = () =>
    `import { EventEmitter } from "node:events"

declare namespace grpc_ts {
${
        i(`
type RpcResolverParams<TContext, TRequest> = {
${
            i(`ctx: TContext,
request: TRequest,
meta: Record<string, string | Buffer>`)
        }
}

interface ClientStream<TRequest> {
${
            i(`on(event: 'data', listener: (data: TRequest) => void): this;
on(event: string, listener: Function): this;`)
        }
}

class ClientStream<TRequest> extends EventEmitter { }

type UnaryResolver<TContext, TRequest, TResponse> = (arg: RpcResolverParams<TContext, TRequest>) => Promise<TResponse> | TResponse

type ClientStreamResolver<TContext, TRequest, TResponse> = (arg: RpcResolverParams<TContext, ClientStream<TRequest>>) => Promise<TResponse> | TResponse

type ServerStreamResolver<TContext, TRequest, TResponse> = UnaryResolver<TContext, TRequest, TResponse>

type BidiStreamResolver<TContext, TRequest, TResponse> = UnaryResolver<TContext, TRequest, TResponse>
`)
    }
}`
