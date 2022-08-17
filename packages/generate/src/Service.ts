import { Method, Service } from 'protobufjs'
import { GrpcType } from './grpcTypes'
import { ParsedPackages } from './types'

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

        return `export type ${this.fullName} = { ${methodsOutput} } `
    }
}

class Rpc {
    method: Method

    constructor(method: Method) {
        this.method = method
    }

    toTS() {
        const rpcParams = ``
        const rpcReturn = ``

        return `  '${this.method.name}': () => void `
    }
}
