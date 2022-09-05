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

interface GrpcClientConfig {
    serviceDocument: Record<string, Service>
    protoPaths: string[]
}

export class GrpcClient {
    constructor(config: GrpcClientConfig) {
        console.log('test', config)
    }
}
