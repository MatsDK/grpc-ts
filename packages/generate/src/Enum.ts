import { Enum } from 'protobufjs'
import { GrpcType } from './grpcTypes'

export class GrpcEnum extends GrpcType {
    enum_: Enum

    constructor(enum_: Enum) {
        super(enum_.fullName)
        this.enum_ = enum_
    }

    toTS() {
        return `export enum ${this.fullName} {
${Object.keys(this.enum_.values).map(value => `  ${value}`).join(',\n')}
}`
    }
}
