import {
    Client,
    GrpcObject,
    loadPackageDefinition,
    ProtobufTypeDefinition,
    ServiceClientConstructor,
} from '@grpc/grpc-js'
import { loadSync } from '@grpc/proto-loader'

interface GenerateOptions {
    protoPaths: string[]
}

const DEFAULT_LOAD_PKG_OPTIONS = {}

export const generate = ({ protoPaths }: GenerateOptions) => {
    const packageDefinition = loadSync(
        protoPaths,
        DEFAULT_LOAD_PKG_OPTIONS,
    )
    const protoDefinition = loadPackageDefinition(packageDefinition)
    const { pacakgeDefs } = parseDefinition(protoDefinition)

    buildTypes(pacakgeDefs)
}

type ParsedPackageDefinitions = { services: ServiceClientConstructor[]; messages: ProtobufTypeDefinition[] }
type ParsedDefinition = Map<string, ParsedPackageDefinitions>

const parseDefinition = (protoDefinition: GrpcObject) => {
    const pacakgeDefs = new Map() as ParsedDefinition

    const nestedPackage = (defs: object, packageName = '') => {
        const packageDefinitions = { services: [], messages: [] } as ParsedPackageDefinitions

        Object.entries(defs).forEach(([name, def]) => {
            const isNotNestedPackage = 'format' in def || def.prototype instanceof Client

            if (isNotNestedPackage) {
                if ('format' in def) packageDefinitions.messages.push(def)
                else if (def.prototype instanceof Client) packageDefinitions.services.push(def)
            } else {
                const nestedPackageName = packageName ? `${packageName}.${name}` : name
                nestedPackage(def, nestedPackageName)
            }
        })
        ;(packageDefinitions.services.length || packageDefinitions.messages.length)
            && pacakgeDefs.set(packageName, packageDefinitions)
    }

    nestedPackage(protoDefinition)

    return { pacakgeDefs }
}

const buildTypes = (pacakgeDefs: ParsedDefinition) => {
    const outputMap: Map<string, string> = new Map()
    pacakgeDefs.forEach((packageDef, packageName) => {
        if (packageDef.messages.length) {
            outputMap.set('common.ts', bulidMessages(packageName, packageDef.messages))
        }
    })

    console.log(outputMap)
}

const bulidMessages = (pkgName: string, pkgMessages: ProtobufTypeDefinition[]) => {
    return `
${
        pkgMessages.map((msg) => {
            const grpcMsg = new GrpcMessage(msg.type, pkgName)
            return grpcMsg.toTS()
        }).join('\n')
    }
`
}

class GrpcMessage {
    type: any
    pacakgeName: string

    constructor(type: any, packageName: string) {
        this.type = type
        this.pacakgeName = packageName
    }

    toTS() {
        const fullMsgName = [...this.pacakgeName.split('.'), this.type.name]
            .map(value => value.charAt(0).toUpperCase() + value.slice(1))
            .join('')

        return `export type ${fullMsgName} = {
}`
    }
}
