import { Enum, loadSync, Namespace, NamespaceBase, Service, Type } from 'protobufjs'
import { GrpcEnum } from './Enum'
import { GrpcMessage } from './Message'
import { Package } from './Package'
import { GrpcService } from './Service'

export class ProtoParser {
    parsed: Package = new Package()

    constructor({ protoPaths }: { protoPaths: string[] }) {
        const protoRoot = loadSync(protoPaths)
        if (!protoRoot.nested) return

        this.parse(protoRoot.nested)
    }

    private parse(obj: NonNullable<NamespaceBase['nested']>, pkg: Package = this.parsed) {
        Object.entries(obj).forEach(([, obj]) => {
            switch (obj.constructor) {
                case Type: {
                    const objAsType = obj as Type
                    this.parseNested(objAsType, pkg)

                    pkg.messages.push(new GrpcMessage(objAsType))
                    break
                }
                case Enum: {
                    pkg.enums.push(new GrpcEnum(obj as Enum))
                    break
                }
                case Service: {
                    pkg.services.push(new GrpcService(obj as Service))
                    break
                }
                case Namespace: {
                    const namespace = obj as Namespace
                    this.parseNested(namespace, pkg)
                    break
                }
                default: {
                    const constructorName = (obj as any).constructor.name
                    console.log(`'${constructorName}' is currently not supported`)
                }
            }
        })

        return pkg
    }

    private parseNested(obj: NamespaceBase, pkg: Package) {
        if (obj.nested) {
            const nestedParsedPkg = this.parse(obj.nested, new Package(obj.fullName))
            pkg.packages[obj.name] = nestedParsedPkg
        }
    }
}
