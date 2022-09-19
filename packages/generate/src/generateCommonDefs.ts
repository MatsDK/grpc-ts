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
type Meta = Record<string, string | Buffer>
type RpcResolverParams<TContext, TRequest> = {
${
            i(`ctx: TContext,
request: TRequest,
meta: Meta`)
        }
}

type ReadableStream<T> = EventEmitter & {
${i(`on(event: 'data', listener: (data: T) => void): void`)}
}

type WritableStream<T> = EventEmitter & {
${i(`write(chunk: T): void`)}
${i(`end(): void`)}
}

type ServerStreamRpcParams<TContext, TRequest, TResponse> = RpcResolverParams<TContext, TRequest> & {
${i(`call: WritableStream<TResponse>`)}
}

type BidiStreamRpcParams<TContext, TRequest, TResponse> = RpcResolverParams<TContext, ReadableStream<TRequest>> & {
${i(`call: WritableStream<TResponse>`)}
}

type UnaryResolver<TContext, TRequest, TResponse> = (arg: RpcResolverParams<TContext, TRequest>) => Promise<TResponse> | TResponse

type ClientStreamResolver<TContext, TRequest, TResponse> = (arg: RpcResolverParams<TContext, ReadableStream<TRequest>>) => Promise<TResponse> | TResponse

type ServerStreamResolver<TContext, TRequest, TResponse> = (arg: ServerStreamRpcParams<TContext, TRequest, TResponse>) => void

type BidiStreamResolver<TContext, TRequest, TResponse> = (arg: BidiStreamRpcParams<TContext, TRequest, TResponse>) => void

type UnaryCall<TRequest, TResponse> = (input: TRequest, meta?: Meta) => Promise<TResponse>

type ClientStreamingCall<TRequest, TResponse> = WritableStream<TRequest> & {
${i(`on(ev: 'end', cb: (error: string | null, response: TResponse) => void): void`)}
${i(`end(): void`)}
}

type ClientStreamCall<TRequest, TResponse> = (meta?: Meta) => ClientStreamingCall<TRequest, TResponse> 

type ServerStreamingCall<TResponse> = ReadableStream<TResponse> & {
${i(`on(ev: 'end', cb: () => void): void`)}
${i(`on(ev: 'error', cb: (error: string) => void): void`)}
${i(`on(ev: 'status', cb: (status: string) => void): void`)}
}

type ServerStreamCall<TRequest, TResponse> = (input: TRequest, meta?: Meta) => ServerStreamingCall<TResponse>

type BidiStreamCall<TRequest, TResponse> = (meta?: Meta) => ServerStreamingCall<TResponse> & ClientStreamingCall<TRequest, TResponse>  
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
