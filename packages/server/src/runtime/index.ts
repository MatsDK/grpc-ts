interface GrpcServerConfig {
    serviceDocument: Record<string, any>
}

export const getGrpcServer = (config: GrpcServerConfig) => {
    return class GrpcServer {
        constructor() {
            console.log(config)
        }
    }
}
