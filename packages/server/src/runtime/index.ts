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

interface GrpcServerConfig {
    serviceDocument: Record<string, object>
    protoPaths: string[]
}

type ResolverFnInput = {
    ctx: object
    request: object
    meta: Record<string, string | Buffer>
}

type ResolverFn = (input: ResolverFnInput) => (any | Promise<any>)

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

        const rpcs = this.config.serviceDocument[name] as any

        const builtHandlers = Object.entries(resolvers)
            .map(([name, resolver]) => {
                const rpc = rpcs.service.methods[name]

                let handlerFn: UntypedHandleCall
                if (!rpc.requestStream) {
                    handlerFn = (async (call, callBack) => {
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
                    }) as handleUnaryCall<any, any>
                } else {
                    handlerFn = (async (call, callBack) => {
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
                    }) as handleClientStreamingCall<any, any>
                }
                return [name, handlerFn] as const
            })
            .reduce((prev, [name, handler]) => {
                prev[name] = handler
                return prev
            }, {} as UntypedServiceImplementation)

        this.server.addService(serviceDef.service, builtHandlers)

        return this
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
