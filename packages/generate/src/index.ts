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
    pacakgeDefs.forEach((packageDef, packageName) => {
        packageDef.messages.length
            && bulidMessages(packageName, packageDef.messages)
    })
}

const bulidMessages = (pkgName: string, pkgMessages: ProtobufTypeDefinition[]) => {
    pkgMessages.forEach((msg) => {
        const type = msg.type as any
        const fullMsgName = [...pkgName.split('.'), type.name]
            .map(value => value.charAt(0).toUpperCase() + value.slice(1))
            .join('')
        console.log(fullMsgName)
    })
}
