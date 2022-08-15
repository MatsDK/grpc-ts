import { Enum, Namespace, NamespaceBase, Service, Type } from 'protobufjs'
import { GrpcEnum } from './Enum'
import { GrpcMessage } from './Message'
import { GrpcService } from './Service'
import { ParsedProtoMap } from './types'

export const parseFromNestedObj = (
    obj: NonNullable<NamespaceBase['nested']>,
    parsed: ParsedProtoMap,
    packageName: string = '',
) => {
    Object.entries(obj).forEach(([, obj]) => {
        switch (obj.constructor) {
            case Type: {
                const objAsType = obj as Type
                if (objAsType.nested) {
                    parsed = parseFromNestedObj(objAsType.nested, parsed, packageName)
                }

                const msg = new GrpcMessage(objAsType, parsed)

                const parsedPackage = parsed.get(packageName) || { enums: [], messages: [], services: [] }
                parsedPackage.messages.push(msg)
                parsed.set(packageName, parsedPackage)

                break
            }
            case Enum: {
                const parsedPackage = parsed.get(packageName) || { enums: [], messages: [], services: [] }

                const enum_ = new GrpcEnum(obj as Enum, parsed)
                parsedPackage.enums.push(enum_)
                parsed.set(packageName, parsedPackage)
                break
            }
            case Service: {
                const parsedPackage = parsed.get(packageName) || { enums: [], messages: [], services: [] }
                const service = new GrpcService(obj as Service)
                parsedPackage.services.push(service)
                parsed.set(packageName, parsedPackage)

                break
            }
            case Namespace: {
                const namespace = obj as Namespace
                if (namespace.nested) {
                    const nestedPackageName = namespace.fullName.split('.')
                        .map(value => value.charAt(0).toUpperCase() + value.slice(1))
                        .join('')

                    parsed = parseFromNestedObj(namespace.nested, parsed, nestedPackageName)
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
