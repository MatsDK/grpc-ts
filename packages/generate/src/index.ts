import { loadSync, NamespaceBase, Service, Type, Namespace } from 'protobufjs'
import { grpcScalarTypeToTSType } from './grpcTypes'

interface GenerateOptions {
    protoPaths: string[]
}

// const DEFAULT_LOAD_PKG_OPTIONS = {
//     keepCase: true,
//     longs: String,
//     enums: String,
//     defaults: true,
//     oneofs: true,
// }

export const generate = ({ protoPaths }: GenerateOptions) => {
    // const packageDefinition = loadSync(
    //     protoPaths,
    //     DEFAULT_LOAD_PKG_OPTIONS,
    // )
    // const protoDefinition = loadPackageDefinition(packageDefinition)
    // const { pacakgeDefs } = parseDefinition(protoDefinition)

    const protoRoot = loadSync(protoPaths)

    if (!protoRoot.nested) return
    const messagesMap = generateFromNestedObj(protoRoot.nested)
    console.log(messagesMap)

    messagesMap.forEach(msg => {
        msg.toTS()
    })

    // buildTypes(pacakgeDefs)
}

type MessagesMap = Map<string, GrpcMessage>

const generateFromNestedObj = (obj: NonNullable<NamespaceBase['nested']>, messages: MessagesMap = new Map()) => {
    Object.entries(obj).forEach(([name, obj]) => {
        switch (obj.constructor) {
            case Type: {
                const msg = new GrpcMessage(obj as Type)
                messages.set(msg.fullName, msg)
                break
            }
            case Service: {
                console.log('service', name)
                break
            }
            case Namespace: {
                const namespace = obj as Namespace
                if (namespace.nested)
                    generateFromNestedObj(namespace.nested, messages)
                break
            }
            default: {
                const constructorName = (obj as any).constructor.name
                console.log(`'${constructorName}' is currently not supported`)
            }
        }
    })

    return messages
}

// type ParsedPackageDefinitions = { services: ServiceClientConstructor[]; messages: ProtobufTypeDefinition[] }
// type ParsedDefinition = Map<string, ParsedPackageDefinitions>

// const parseDefinition = (protoDefinition: GrpcObject) => {
//     const pacakgeDefs = new Map() as ParsedDefinition

//     const nestedPackage = (defs: object, packageName = '') => {
//         const packageDefinitions = { services: [], messages: [] } as ParsedPackageDefinitions

//         Object.entries(defs).forEach(([name, def]) => {
//             const isNotNestedPackage = 'format' in def || def.prototype instanceof Client

//             if (isNotNestedPackage) {
//                 if ('format' in def) packageDefinitions.messages.push(def)
//                 else if (def.prototype instanceof Client) packageDefinitions.services.push(def)
//             } else {
//                 const nestedPackageName = packageName ? `${packageName}.${name}` : name
//                 nestedPackage(def, nestedPackageName)
//             }
//         })
//             ; (packageDefinitions.services.length || packageDefinitions.messages.length)
//                 && pacakgeDefs.set(packageName, packageDefinitions)
//     }

//     nestedPackage(protoDefinition)

//     return { pacakgeDefs }
// }

// const buildTypes = (pacakgeDefs: ParsedDefinition) => {
//     const outputMap: Map<string, string> = new Map()
//     pacakgeDefs.forEach((packageDef, packageName) => {
//         if (packageDef.messages.length) {
//             outputMap.set('common.ts', bulidMessages(packageName, packageDef.messages))
//         }
//     })

//     console.log(outputMap)
// }


class GrpcMessage {
    msg: Type

    constructor(msg: Type) {
        this.msg = msg
    }

    toTS() {
        Object.entries(this.msg.fields).forEach(([_name, field]) => {
            console.log(field.name, field.type, grpcScalarTypeToTSType(field.type))
        })
    }

    get fullName() {
        return this.msg.fullName.split(".")
            .map(value => value.charAt(0).toUpperCase() + value.slice(1))
            .join('')

    }
}
