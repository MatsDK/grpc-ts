import { Service } from 'protobufjs'
import { GrpcType } from './grpcTypes'

export class GrpcService extends GrpcType {
    service: Service

    constructor(service: Service) {
        super(service.fullName)
        this.service = service
    }

    toTS() {
        const methods = Object.entries(this.service.methods)

        let methodsOutput = ``
        if (methods.length) {
            methodsOutput = `
${
                methods.map(([, method]) => {
                    return `  '${method.name}': () => void `
                }).join('\n')
            }
`
        }

        return `export type ${this.fullName} = {${methodsOutput}}`
    }
}
