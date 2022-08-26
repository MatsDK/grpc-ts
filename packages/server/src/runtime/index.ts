import {
    GrpcObject,
    handleClientStreamingCall,
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

type ResolverFn = Function

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

                let handlerFn: UntypedHandleCall
                if (rpc.requestStream) handlerFn = this.clientStreamingRpcHandler(resolver)
                else handlerFn = this.unaryRpcHandler(resolver)

                return [name, handlerFn] as const
            })
            .reduce((prev, [name, handler]) => {
                prev[name] = handler
                return prev
            }, {} as UntypedServiceImplementation)
    }

    private unaryRpcHandler(resolver: Function): handleUnaryCall<any, any> {
        return async (call, callBack) => {
            try {
                const response = await resolver({
                    ctx: {},
                    meta: call.metadata.getMap(),
                    request: call.request,
                })
                callBack(null, response)
            } catch (e) {
                callBack(e as any)
            }
        }
    }

    private clientStreamingRpcHandler(resolver: Function): handleClientStreamingCall<any, any> {
        return async (call, callBack) => {
            try {
                const response = await resolver({
                    ctx: {},
                    meta: call.metadata.getMap(),
                    request: call,
                })
                callBack(null, response)
            } catch (e) {
                callBack(e as any)
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
