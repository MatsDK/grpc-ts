import { credentials, GrpcObject, loadPackageDefinition } from '@grpc/grpc-js'
import { loadSync } from '@grpc/proto-loader'
import _ from 'lodash'

interface RPC {
    requestType: string
    requestStream: boolean
    responseType: string
    responseStream: boolean
}

interface Service {
    name: string
    service: {
        methods: Record<string, RPC>
    }
}

interface GrpcClientConfig {
    serviceDocument: Record<string, Service>
    protoPaths: string[]
}

const loaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
}

interface GrpcClientOptions {
    url: string
}

export class GrpcClient {
    readonly config: GrpcClientConfig
    readonly protoDescriptor: GrpcObject

    opts: GrpcClientOptions

    constructor(config: GrpcClientConfig, opts: GrpcClientOptions) {
        this.config = config
        this.opts = opts

        const pkgDef = loadSync(config.protoPaths, loaderOptions)
        this.protoDescriptor = loadPackageDefinition(pkgDef)

        return applyDocument(this)
    }
}

type Services = Record<string, Service>

const applyDocument = (client: GrpcClient) => {
    const serviceRecord: Services = {}

    Object.values(client.config.serviceDocument).forEach((service) => {
        _.set(serviceRecord, service.name.slice(1), service)
    })

    return applyPkg(client, serviceRecord, client)
}

const applyPkg = <T extends object>(obj: T, services: Services, client: GrpcClient): T => {
    const clientCache = {} as Record<string, object>

    return new Proxy(obj, {
        get(target, prop) {
            if (prop in target || typeof prop === 'symbol') return (target as any)[prop]

            if (clientCache[prop] !== undefined) return clientCache[prop]

            if (prop in services) {
                clientCache[prop] = services[prop]

                // if (services[prop] instanceof GrpcService) {
                if ('name' in services[prop] && 'service' in services[prop]) {
                    return applyRpcs(services[prop], client)
                } else {
                    return applyPkg({}, services[prop] as any as Services, client)
                }
            }
        },
    })
}

type ResolverFn = (...args: any) => any

const applyRpcs = ({ name, service }: Service, client: GrpcClient) => {
    return Object.entries(service.methods).map(([rpcName, rpc]) => {
        const Service = _.get(client.protoDescriptor, name.slice(1)) as any
        const serviceClientImpl = new Service(client.opts.url, credentials.createInsecure())

        let handlerFn: ResolverFn = null!
        // if (rpc.requestStream && rpc.responseStream) handlerFn = this.bidiStreamingRpcHandler(resolver)
        // else if (rpc.requestStream) handlerFn = this.clientStreamingRpcHandler(resolver)
        // else if (rpc.responseStream) handlerFn = this.serverStreamingRpcHandler(resolver)
        if (!handlerFn) handlerFn = unaryCallHandler(rpcName, serviceClientImpl)

        return [rpcName, handlerFn] as const
    }).reduce((prev, [rpcName, rpc]) => {
        prev[rpcName] = rpc

        return prev
    }, {} as Record<string, ResolverFn>)
}

const unaryCallHandler = (rpcName: string, serviceImpl: Record<string, ResolverFn>) => {
    return async (input: unknown) => {
        const res = await new Promise((res, rej) => {
            if (!serviceImpl[rpcName]) rej(`${rpcName} does not exist`)

            serviceImpl[rpcName](input, (err: string, response: unknown) => {
                if (err) rej(err)

                res(response)
            })
        })

        return res
    }
}
