import {
    GrpcObject,
    loadPackageDefinition,
    Server,
    ServerCredentials,
    ServiceClientConstructor,
    UntypedServiceImplementation,
} from '@grpc/grpc-js'
import { loadSync } from '@grpc/proto-loader'
import _ from 'lodash'

interface GrpcServerConfig {
    serviceDocument: Record<string, object>
    protoPaths: string[]
}

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

    addServiceResolvers(name: string, resolvers: UntypedServiceImplementation) {
        if (!(name in this.config.serviceDocument)) {
            console.log(`Service: '${name}' does not exist`)
            return this
        }

        const serviceDef = _.get(this.protoDescriptor, name) as ServiceClientConstructor
        if (!serviceDef) return
        this.server.addService(serviceDef.service, resolvers)

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
