import { Enum, Field, loadSync, Namespace, NamespaceBase, Service, Type } from 'protobufjs'
import { grpcScalarTypeToTSType } from './grpcTypes'

interface GenerateOptions {
    protoPaths: string[]
    outDir: string
}
export const generate = ({ protoPaths, outDir }: GenerateOptions) => {
    const protoRoot = loadSync(protoPaths)

    if (!protoRoot.nested) return
    const messagesMap = generateFromNestedObj(protoRoot.nested)
    console.log(messagesMap)

    messagesMap.forEach(msg => {
        console.log(msg.toTS())
    })
}

type MessagesMap = Map<string, GrpcMessage>

const generateFromNestedObj = (obj: NonNullable<NamespaceBase['nested']>, messages: MessagesMap = new Map()) => {
    Object.entries(obj).forEach(([name, obj]) => {
        switch (obj.constructor) {
            case Type: {
                const objAsType = obj as Type
                if (objAsType.nested) {
                    generateFromNestedObj(objAsType.nested, messages)
                }

                const msg = new GrpcMessage(objAsType)
                messages.set(msg.fullName, msg)
                break
            }
            case Enum: {
                console.log('enum')
                break
            }
            case Service: {
                console.log('service', name)
                break
            }
            case Namespace: {
                const namespace = obj as Namespace
                if (namespace.nested) {
                    generateFromNestedObj(namespace.nested, messages)
                }
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

class GrpcMessage {
    msg: Type

    constructor(msg: Type) {
        this.msg = msg
    }

    toTS() {
        if (this.msg.oneofs) {
            console.log('oneof')
        }

        return `export type ${this.fullName} = {
${
            this.msg.fieldsArray.map(field => {
                const msgField = new GrpcMessageField(field)
                return msgField.toTS()
            }).join('\n')
        }
}`
    }

    get fullName() {
        return this.msg.fullName.split('.')
            .map(value => value.charAt(0).toUpperCase() + value.slice(1))
            .join('')
    }
}

class GrpcMessageField {
    field: Field

    constructor(field: Field) {
        this.field = field
    }

    toTS() {
        const { name, type, repeated } = this.field
        return `  ${name}: ${grpcScalarTypeToTSType(type)}${(repeated || '') && '[]'}`
    }
}
