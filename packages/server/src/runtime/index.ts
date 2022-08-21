interface GrpcServerConfig {
    serviceDocument: Record<string, any>
}

export class GrpcServer {
    constructor(config: GrpcServerConfig) {
        console.log(config)
    }

    addServiceResolvers(name: string, resolvers: any) {
        console.log(name, resolvers)
    }
}

export const getGrpcServer = (config: GrpcServerConfig) => {
    return new GrpcServer(config)
}
