import _ from 'lodash'
import { ProtoParser } from './parseProtoObj'
import { GrpcService } from './Service'
import { ExportCollector, i } from './utils'

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

        console.log()

        return `import { ServicesMap } from '.'

export class GrpcClient {
${i(generateProxysForServices(this.opts.protoParser.services))}
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

type Services = Record<string, GrpcService>

const generateProxysForServices = (services: Services) => {
    const serviceRecord: Services = {}

    Object.values(services).forEach((service) => {
        _.set(serviceRecord, service.name.slice(1), service)
    })

    return applyServices(serviceRecord)
}

const applyServices = (services: Services) => {
    let ret = ``

    Object.entries(services).forEach(([name, service]) => {
        if (service instanceof GrpcService) {
            ret += `\nget ${name}(): any\n`
        } else {
            ret += `\nget ${name}(): {
${i(applyServices(service))}
}
`
        }
    })

    return ret
}
