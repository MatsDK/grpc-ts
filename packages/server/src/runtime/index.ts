interface GrpcServerConfig {
    parsedDef: any
}

export const getGrpcServer = (config: GrpcServerConfig) => {
    return class GrpcServer {
        constructor() {
            console.log(config)
        }
    }
}
