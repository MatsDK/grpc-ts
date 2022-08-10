import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Enum, loadSync, Namespace, NamespaceBase, Service, Type } from 'protobufjs'
import { GrpcEnum } from './Enum'
import { GrpcMessage } from './Message'
import { ParsedProtoMap } from './types'

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
