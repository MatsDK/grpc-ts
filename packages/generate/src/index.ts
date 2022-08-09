import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Enum, Field, loadSync, Namespace, NamespaceBase, Service, Type } from 'protobufjs'
import { grpcScalarTypeToTSType } from './grpcTypes'

interface GenerateOptions {
    protoPaths: string[]
    outDir: string
}
export const generate = ({ protoPaths, outDir }: GenerateOptions) => {
    const protoRoot = loadSync(protoPaths)

    if (!protoRoot.nested) return
    const parsedProto = generateFromNestedObj(protoRoot.nested, new Map())

    const outputFileMap: Record<string, string> = {}
    outputFileMap['index.d.ts'] = Array.from(parsedProto)
        .map(([name, { messages, enums }]) => {
            return `// ${name}
${
                messages.map(msg => {
                    return msg.toTS()
                }).join('\n\n')
            }

${
                enums.map(e => {
                    return e.toTS()
                }).join('\n\n')
            }
`
        }).join('\n')

    Object.entries(outputFileMap).forEach(([fileName, output]) => {
        const path = join(outDir, fileName)

        writeFileSync(path, output)
    })
}

type ParsedPackage = { messages: GrpcMessage[]; enums: GrpcEnum[] }
type ParsedProtoMap = Map<string, ParsedPackage>

const generateFromNestedObj = (
    obj: NonNullable<NamespaceBase['nested']>,
    parsed: ParsedProtoMap,
    packageName: string = '',
) => {
    Object.entries(obj).forEach(([name, obj]) => {
        switch (obj.constructor) {
            case Type: {
                const objAsType = obj as Type
                if (objAsType.nested) {
                    parsed = generateFromNestedObj(objAsType.nested, parsed, packageName)
                }

                const msg = new GrpcMessage(objAsType, parsed)

                const parsedPackage = parsed.get(packageName) || { enums: [], messages: [] }
                parsedPackage.messages.push(msg)
                parsed.set(packageName, parsedPackage)

                break
            }
            case Enum: {
                const parsedPackage = parsed.get(packageName) || { enums: [], messages: [] }

                const enum_ = new GrpcEnum(obj as Enum, parsed)
                parsedPackage.enums.push(enum_)
                parsed.set(packageName, parsedPackage)
                break
            }
            case Service: {
                console.log('service', name)
                break
            }
            case Namespace: {
                const namespace = obj as Namespace
                if (namespace.nested) {
                    const nestedPackageName = namespace.fullName.split('.')
                        .map(value => value.charAt(0).toUpperCase() + value.slice(1))
                        .join('')

                    parsed = generateFromNestedObj(namespace.nested, parsed, nestedPackageName)
                }
                break
            }
            default: {
                const constructorName = (obj as any).constructor.name
                console.log(`'${constructorName}' is currently not supported`)
            }
        }
    })

    return parsed
}

abstract class GrpcType {
    name: string

    constructor(fullName: string) {
        this.name = fullName
    }

    abstract toTS(): string

    get fullName() {
        return this.name.split('.')
            .map(value => value.charAt(0).toUpperCase() + value.slice(1))
            .join('')
    }
}

class GrpcMessage extends GrpcType {
    msg: Type
    parsedProto: ParsedProtoMap

    constructor(msg: Type, parsedProto: ParsedProtoMap) {
        super(msg.fullName)
        this.msg = msg
        this.parsedProto = parsedProto
    }

    toTS() {
        let fields = this.msg.fieldsArray

        let generatedOneOfFields = ``
        if (this.msg.oneofs) {
            Object.entries(this.msg.oneofs).map(([name, oneof]) => {
                fields = fields.filter((field) => !oneof.oneof.includes(field.name))

                const oneofFields = oneof.fieldsArray.map((field) => {
                    const oneofKeyField = `${name}: '${field.name}'`
                    const oneofField = new GrpcMessageField(field)

                    return `{\n${oneofField.toTS(this.parsedProto)}\n  ${oneofKeyField}\n}`
                }).join(' |\n')

                generatedOneOfFields += ` & (\n${oneofFields} | {}\n)`
            }).join(' |\n')
        }

        let generatedFields = ``
        if (fields.length) {
            generatedFields += `
${
                fields.map(field => {
                    const msgField = new GrpcMessageField(field)
                    return msgField.toTS(this.parsedProto)
                }).join('\n')
            }
`
        }

        return `export type ${this.fullName} = {${generatedFields}}${generatedOneOfFields}`
    }
}

class GrpcEnum extends GrpcType {
    enum_: Enum
    parsedProto: ParsedProtoMap

    constructor(enum_: Enum, parsedProto: ParsedProtoMap) {
        super(enum_.fullName)
        this.enum_ = enum_
        this.parsedProto = parsedProto
    }

    toTS() {
        return `export enum ${this.fullName} {
${Object.keys(this.enum_.values).map(value => `  ${value}`).join(',\n')}
}`
    }
}

class GrpcMessageField {
    field: Field

    constructor(field: Field) {
        this.field = field
    }

    toTS(parsedProto: ParsedProtoMap) {
        const { name, type, repeated } = this.field
        let scalarType = grpcScalarTypeToTSType(type)

        if (!scalarType) {
            scalarType = findMessageName(this.field, parsedProto)
        }

        return `  ${name}: ${scalarType}${(repeated || '') && '[]'}`
    }
}

const findMessageName = (field: Field, parsedProto: ParsedProtoMap) => {
    const { messages, enums } = getAllNamesFromParsedProto(parsedProto)
    if (!field.parent?.fullName) return field.type

    const parentNameParts = (field.parent.fullName.split('.'))

    for (let i = parentNameParts.length; i >= 0; i--) {
        const currName = formatName([...parentNameParts.slice(0, i), ...field.type.split('.')])

        if (messages.includes(currName) || enums.includes(currName)) {
            return currName
        }
    }

    return formatName(field.type.split('.'))
}

const getAllNamesFromParsedProto = (parsedProto: ParsedProtoMap) => {
    let enumNames = [] as string[]
    let messageNames = [] as string[]

    parsedProto.forEach(({ messages, enums }, pkgName) => {
        messages.forEach(({ fullName }) => {
            messageNames.push(fullName)
        })
        enums.forEach(({ fullName }) => {
            enumNames.push(fullName)
        })
    })

    return { enums: enumNames, messages: messageNames }
}

const formatName = (parts: string[]) =>
    parts
        .map(value => value.charAt(0).toUpperCase() + value.slice(1)).join('')
