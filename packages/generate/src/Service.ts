import { Method, Service } from 'protobufjs'
import { grpcScalarTypeToTSType, GrpcType } from './grpcTypes'
import { ProtoParser } from './parseProtoObj'
import { formatName, i, msgNameExists } from './utils'

export class GrpcService extends GrpcType {
    service: Service

    constructor(service: Service) {
        super(service.fullName)
        this.service = service
    }

    toTS(protoParser: ProtoParser) {
        const methods = Object.entries(this.service.methods)

        let methodsOutput = ``
        if (methods.length) {
            methodsOutput = `
${
                methods
                    .map(([, method]) => (new Rpc(method)).toTS(protoParser))
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

    toTS(protoParser: ProtoParser) {
        let requestType = grpcScalarTypeToTSType(this.method.requestType),
            responseType = grpcScalarTypeToTSType(this.method.responseType)

        if (!requestType) {
            requestType = formatName(this.method.requestType.split('.'))

            if (!msgNameExists(protoParser.parsed, requestType)) {
                if (this.method.requestType.split('.').length > 1) {
                    console.log(`'${this.method.requestType}' not found`)
                } else {
                    requestType = formatName([
                        ...(this.method.parent?.parent?.fullName || '').split('.'),
                        ...this.method.requestType.split('.'),
                    ])
                }
            }
        }
        if (!responseType) {
            responseType = formatName(this.method.responseType.split('.'))

            if (!msgNameExists(protoParser.parsed, responseType)) {
                if (this.method.responseType.split('.').length > 1) {
                    console.log(`'${this.method.responseType}' not found`)
                } else {
                    responseType = formatName([
                        ...(this.method.parent?.parent?.fullName || '').split('.'),
                        ...this.method.responseType.split('.'),
                    ])
                }
            }
        }

        const rpcParams = this.method.requestStream ? `grpc_ts.Stream<${requestType}>` : `${requestType}`
        const rpcReturn = this.method.responseStream ? `grpc_ts.Stream<${responseType}>` : `${responseType}`

        return i(`'${this.method.name}': (arg: ${rpcParams}) => ${rpcReturn} `)
    }
}
