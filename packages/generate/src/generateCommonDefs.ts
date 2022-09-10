import _ from 'lodash'
import { ProtoParser } from './parseProtoObj'
import { GrpcService } from './Service'
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

        return `${defaultGrpcTSDefs()}

// -------------- Messages/Enums --------------
${parsed.toTS(this.protoParser)}

// -------------- Services --------------
${generateGrpcResolversNamespace(services, this.protoParser)}
${generateGrpcCallsNamespace(services, this.protoParser)}

${this.exportCollector.tsExports.join('\n')}
`
    }

    toJS() {
        this.configExport['serviceDocument'] = `JSON.parse(serviceDefsString)`
        this.configExport['protoPaths'] = `${JSON.stringify(this.protoParser.protoPaths)}`

        return `const serviceDefsString = \`${JSON.stringify(this.protoParser.services, null, 2)}\`

exports.config = {
${
            Object.entries(this.configExport).map(([key, value]) => {
                return `  ${key}: ${value}`
            }).join(',\n')
        }
}

module.exports = {
${i(`${this.exportCollector.jsExports.join(',\n')}`)}
}
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

type ClientReadableStream<TRequest> = EventEmitter & {
${i(`on(event: 'data', listener: (data: TRequest) => void): void`)}
}

type ServerWritableStream<TResponse> = EventEmitter & {
${i(`write(chunk: TResponse): void`)}
${i(`end(): void`)}
}

type ServerStreamRpcParams<TContext, TRequest, TResponse> = RpcResolverParams<TContext, TRequest> & {
${i(`call: ServerWritableStream<TResponse>`)}
}

type BidiStreamRpcParams<TContext, TRequest, TResponse> = RpcResolverParams<TContext, ClientReadableStream<TRequest>> & {
${i(`call: ServerWritableStream<TResponse>`)}
}

type UnaryResolver<TContext, TRequest, TResponse> = (arg: RpcResolverParams<TContext, TRequest>) => Promise<TResponse> | TResponse

type ClientStreamResolver<TContext, TRequest, TResponse> = (arg: RpcResolverParams<TContext, ClientReadableStream<TRequest>>) => Promise<TResponse> | TResponse

type ServerStreamResolver<TContext, TRequest, TResponse> = (arg: ServerStreamRpcParams<TContext, TRequest, TResponse>) => void

type BidiStreamResolver<TContext, TRequest, TResponse> = (arg: BidiStreamRpcParams<TContext, TRequest, TResponse>) => void

type UnaryCall<TRequest, TResponse> = any

type ClientStreamCall<TRequest, TResponse> = any

type ServerStreamCall<TRequest, TResponse> = any

type BidiStreamCall<TRequest, TResponse> = any
`)
    }
}`

type Services = Record<string, GrpcService>

const generateGrpcResolversNamespace = (services: Services, protoParser: ProtoParser) => {
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

    return `export namespace grpc_resolvers {
${
        i(`${generateServiceFields(services, protoParser, 'resolver')}

// Services Map
export type ServicesMap<TContext = {}> = {${serviceMapFields}}`)
    }
}
`
}

const generateGrpcCallsNamespace = (services: Services, protoParser: ProtoParser) => {
    let serviceTreeFields = ``
    if (Object.entries(services).length) {
        serviceTreeFields = `\n${i(generateProxysForServices(services))}\n`
    }

    return `export namespace grpc_calls {
${
        i(`${generateServiceFields(services, protoParser, 'call')}

// Services Tree
export type ServicesTree = {${serviceTreeFields}}`)
    }
}
`
}

const generateServiceFields = (services: Services, protoParser: ProtoParser, type: 'resolver' | 'call') => {
    return Object.values(services).map((service) => {
        return service.toTS(protoParser, type)
    }).join('\n\n')
}

const generateProxysForServices = (services: Services) => {
    const serviceRecord: Services = {}

    Object.values(services).forEach((service) => {
        _.set(serviceRecord, service.name.slice(1), service)
    })

    return applyServices(serviceRecord)
}

const applyServices = (services: Services): string => {
    return Object.entries(services).map(([name, service]) => {
        if (service instanceof GrpcService) {
            return `${name}: ${service.fullName}`
        } else {
            return `${name}: {
${i(applyServices(service))}
}`
        }
    }).join('\n')
}

const generateServiceRpcs = (service: GrpcService) => {
    return Object.entries(service.service.methods).map(([, method]) => {
        console.log(method)
        return `${method.name}: () => `
    }).join('\n')
}
