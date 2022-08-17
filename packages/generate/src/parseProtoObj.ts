import { Enum, loadSync, Namespace, NamespaceBase, Service, Type } from 'protobufjs'
import { GrpcEnum } from './Enum'
import { GrpcMessage } from './Message'
import { GrpcService } from './Service'
import { ParsedPackage, ParsedPackages, ParsedProto } from './types'

export class ProtoParser implements ParsedProto {
    parsedPackages: ParsedPackages = {}

    constructor() {}

    parseObj(protoPaths: string[]) {
        const protoRoot = loadSync(protoPaths)
        if (!protoRoot.nested) return

        this.parseNestedObj(protoRoot.nested)
        return this.parsedPackages
    }

    private parseNestedObj(obj: NonNullable<NamespaceBase['nested']>, packageName: string = '') {
        Object.entries(obj).forEach(([, obj]) => {
            switch (obj.constructor) {
                case Type: {
                    const objAsType = obj as Type
                    if (objAsType.nested) {
                        this.parseNestedObj(objAsType.nested, packageName)
                    }

                    this.addMessage(packageName, new GrpcMessage(objAsType))

                    break
                }
                case Enum: {
                    this.addEnum(packageName, new GrpcEnum(obj as Enum))

                    break
                }
                case Service: {
                    this.addService(packageName, new GrpcService(obj as Service))

                    break
                }
                case Namespace: {
                    const namespace = obj as Namespace
                    if (namespace.nested) {
                        const nestedPackageName = namespace.fullName.split('.')
                            .map(value => value.charAt(0).toUpperCase() + value.slice(1))
                            .join('')

                        this.parseNestedObj(namespace.nested, nestedPackageName)
                    }

                    break
                }
                default: {
                    const constructorName = (obj as any).constructor.name
                    console.log(`'${constructorName}' is currently not supported`)
                }
            }
        })
    }

    private getPkg(packageName: string): ParsedPackage {
        return this.parsedPackages[packageName] || { enums: [], messages: [], services: [] }
    }

    private addMessage(packageName: string, msg: GrpcMessage) {
        const pkg = this.getPkg(packageName)
        pkg.messages.push(msg)
        this.parsedPackages[packageName] = pkg
    }

    private addEnum(packageName: string, enum_: GrpcEnum) {
        const pkg = this.getPkg(packageName)
        pkg.enums.push(enum_)
        this.parsedPackages[packageName] = pkg
    }

    private addService(packageName: string, service: GrpcService) {
        const pkg = this.getPkg(packageName)
        pkg.services.push(service)
        this.parsedPackages[packageName] = pkg
    }
}
