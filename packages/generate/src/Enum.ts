import { Enum } from 'protobufjs'
import { GrpcType } from './grpcTypes'
import { ParsedProtoMap } from './types'

export class GrpcEnum extends GrpcType {
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
