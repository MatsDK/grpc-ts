import { Package } from './Package'
import { ProtoParser } from './parseProtoObj'
import { GrpcService } from './Service'
import { ExportCollector } from './utils'

interface GrpcClientGeneratorOptions {
    exportCollector: ExportCollector
    protoParser: ProtoParser
}

export class GrpcTsClientGenerator {
    opts: GrpcClientGeneratorOptions

    constructor(opts: GrpcClientGeneratorOptions) {
        this.opts = opts
    }

    toTS() {
        this.opts.exportCollector.addExport('TS', `export * from "./client"`)

        console.log(generateProxysForServices(this.opts.protoParser.services))

        return `import { ServicesMap } from '.'

export class GrpcClient {

}

export declare function createGrpcClient(): GrpcClient
`
    }

    toJS() {
        this.opts.exportCollector.addExport(
            'JS',
            `...require("./client")`,
        )

        return `const { GrpcClient } = require("@grpc-ts/client/src/runtime")
const { config } = require(".")

exports.createGrpcClient = (options) => {
  return new GrpcClient(config, options)
}
`
    }
}

const generateProxysForServices = (services: Record<string, GrpcService>, path = '') => {
    const map: Map<string, any[]> = new Map()

    Object.values(services).forEach((service) => {
        const nameParts = service.name.split('.')
        const path = nameParts.slice(0, -1).join('.')
        const name = nameParts.pop() || ''

        if (map.get(path)) {
            map.set(path, [...map.get(path)!, name])
        } else map.set(path, [name])
    })

    console.log(map)

    return ``
}
