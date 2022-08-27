import {
    GrpcObject,
    handleClientStreamingCall,
    handleServerStreamingCall,
    handleUnaryCall,
    loadPackageDefinition,
    Server,
    ServerCredentials,
    ServiceClientConstructor,
    UntypedHandleCall,
    UntypedServiceImplementation,
} from '@grpc/grpc-js'
import { loadSync } from '@grpc/proto-loader'
import _ from 'lodash'

interface Service {
    name: string
    service: {
        methods: Record<string, {
            requestType: string
            requestStream: boolean
            responseType: string
            responseStream: boolean
        }>
    }
}

interface GrpcServerConfig {
    serviceDocument: Record<string, Service>
    protoPaths: string[]
}

type ResolverFn = (...args: any) => any

const loaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
}

export class GrpcServer {
    private config: GrpcServerConfig

    private protoDescriptor: GrpcObject
    private server: Server

    constructor(config: GrpcServerConfig) {
        this.config = config

        const pkgDef = loadSync(config.protoPaths, loaderOptions)
        this.protoDescriptor = loadPackageDefinition(pkgDef)
        this.server = new Server()
    }

    addServiceResolvers(name: string, resolvers: Record<string, ResolverFn>) {
        if (!(name in this.config.serviceDocument)) {
            console.log(`Service: '${name}' does not exist`)
            return this
        }

        const serviceDef = _.get(this.protoDescriptor, name) as ServiceClientConstructor
        if (!serviceDef) return

        const builtHandlers = this.buildHandlersForService(name, resolvers)
        this.server.addService(serviceDef.service, builtHandlers)

        return this
    }

    private buildHandlersForService(serviceName: string, resolvers: Record<string, ResolverFn>) {
        const rpcs = this.config.serviceDocument[serviceName]

        return Object.entries(resolvers)
            .map(([name, resolver]) => {
                const rpc = rpcs.service.methods[name]

                let handlerFn: UntypedHandleCall = null!

                if (rpc.requestStream && rpc.responseStream) throw ('bidi not implented yet')
                else if (rpc.requestStream) handlerFn = this.clientStreamingRpcHandler(resolver)
                else if (rpc.responseStream) handlerFn = this.serverStreamingRpcHandler(resolver)
                else if (!handlerFn) handlerFn = this.unaryRpcHandler(resolver)

                return [name, handlerFn] as const
            })
            .reduce((prev, [name, handler]) => {
                prev[name] = handler
                return prev
            }, {} as UntypedServiceImplementation)
    }

    private unaryRpcHandler(resolver: ResolverFn): handleUnaryCall<any, any> {
        return async (call, callBack) => {
            try {
                const response = await resolver({
                    ctx: {},
                    meta: call.metadata.getMap(),
                    request: call.request,
                })

                callBack(null, response)
            } catch (e) {
                const error = e as Error
                callBack({ message: error.message, name: error.name })
            }
        }
    }

    private clientStreamingRpcHandler(resolver: ResolverFn): handleClientStreamingCall<any, any> {
        return async (call, callBack) => {
            try {
                const response = await resolver({
                    ctx: {},
                    meta: call.metadata.getMap(),
                    request: call,
                })
                callBack(null, response)
            } catch (e) {
                const error = e as Error
                callBack({ message: error.message, name: error.name })
            }
        }
    }

    private serverStreamingRpcHandler(resolver: ResolverFn): handleServerStreamingCall<any, any> {
        return async (call) => {
            try {
                await resolver({
                    ctx: {},
                    meta: call.metadata.getMap(),
                    request: call.request,
                    call,
                })
            } catch (e) {
                const error = e as Error
                call.emit('error', error)
            }
        }
    }

    listen(url: string, cb?: (error: Error | null, port: number) => void) {
        this.server.bindAsync(url, ServerCredentials.createInsecure(), (error, port) => {
            this.server.start()

            if (cb) {
                cb(error, port)
            }
        })
    }
}
