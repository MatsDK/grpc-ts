import { ProtoParser } from './parseProtoObj'
import { i } from './utils'
import { ExportCollector } from './utils'

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
        return `const serviceDefsString = \`${JSON.stringify(this.protoParser.services, null, 2)}\`
const serviceDefs = JSON.parse(serviceDefsString)

exports.config = {
    serviceDocument: serviceDefs
}
${this.exportCollector.jsExports.join('\n')}
`
    }
}

const defaultGrpcTSDefs = () =>
    `declare namespace grpc_ts {
${
        i(`
type RpcResolverParams<TContext, TRequest> = {
${
            i(`ctx: TContext,
request: TRequest`)
        }
}

type RpcResolver<TContext, TRequest, TResponse> = (arg: RpcResolverParams<TContext, TRequest>) => Promise<TResponse> | TResponse
`)
    }
}`
