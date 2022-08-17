import { Method, Service } from 'protobufjs'
import { grpcScalarTypeToTSType, GrpcType } from './grpcTypes'
import { ParsedPackages } from './types'
import { formatName } from './utils'

export class GrpcService extends GrpcType {
    service: Service

    constructor(service: Service) {
        super(service.fullName)
        this.service = service
    }

    toTS(parsedPackages: ParsedPackages) {
        const methods = Object.entries(this.service.methods)

        let methodsOutput = ``
        if (methods.length) {
            methodsOutput = `
${
                methods
                    .map(([, method]) => (new Rpc(method)).toTS())
                    .join('\n')
            }
`
        }

        return `export type ${this.fullName} = {${methodsOutput}}`
    }
}

class Rpc {
    method: Method

    constructor(method: Method) {
        this.method = method
    }

    toTS() {
        let requestType = grpcScalarTypeToTSType(this.method.requestType),
            responseType = grpcScalarTypeToTSType(this.method.requestType)

        if (!requestType) {
            requestType = formatName(this.method.requestType.split('.'))
        }
        if (!responseType) {
            responseType = formatName(this.method.responseType.split('.'))
        }

        console.log(this.method.fullName)

        const rpcParams = this.method.requestStream ? `grpc_ts.Stream<${requestType}>` : `${requestType}`
        const rpcReturn = this.method.responseStream ? `grpc_ts.Stream<${responseType}>` : `${responseType}`

        return `  '${this.method.name}': (arg: ${rpcParams}) => ${rpcReturn} `
    }
}
