import { GrpcEnum } from './Enum'
import { GrpcMessage } from './Message'
import { ProtoParser } from './parseProtoObj'
import { formatName } from './utils'

export class Package {
    pkgName: string

    messages: GrpcMessage[] = []
    enums: GrpcEnum[] = []

    packages: Record<string, Package> = {}

    constructor(name = '') {
        this.pkgName = name
    }

    toTS(protoParser: ProtoParser): string {
        return `// ${formatName(this.pkgName.split('.')) || 'Root'}
${this.messages.map((message) => message.toTS(protoParser)).join('\n')}
${this.enums.map((_enum) => _enum.toTS()).join('\n')}
${Object.entries(this.packages).map(([, pkg]) => pkg.toTS(protoParser)).join('\n')}`
    }
}
