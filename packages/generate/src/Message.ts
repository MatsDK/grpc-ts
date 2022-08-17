import { Field, Type } from 'protobufjs'
import { grpcScalarTypeToTSType, GrpcType } from './grpcTypes'
import { ParsedPackages, ParsedProto } from './types'
import { findMessageName } from './utils'

export class GrpcMessage extends GrpcType {
    msg: Type

    constructor(msg: Type) {
        super(msg.fullName)
        this.msg = msg
    }

    toTS(parsedProto: ParsedPackages) {
        let fields = this.msg.fieldsArray

        let generatedOneOfFields = ``
        if (this.msg.oneofs) {
            Object.entries(this.msg.oneofs).map(([name, oneof]) => {
                fields = fields.filter((field) => !oneof.oneof.includes(field.name))

                const oneofFields = oneof.fieldsArray.map((field) => {
                    const oneofKeyField = `${name}: '${field.name}'`
                    const oneofField = new GrpcMessageField(field)

                    return `{\n${oneofField.toTS(parsedProto)}\n  ${oneofKeyField}\n}`
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
                    return msgField.toTS(parsedProto)
                }).join('\n')
            }
`
        }

        return `export type ${this.fullName} = {${generatedFields}}${generatedOneOfFields}`
    }
}

export class GrpcMessageField {
    field: Field

    constructor(field: Field) {
        this.field = field
    }

    toTS(parsedProto: ParsedProto['parsedPackages']) {
        const { name, type, repeated } = this.field
        let scalarType = grpcScalarTypeToTSType(type)

        if (!scalarType) {
            scalarType = findMessageName(this.field, parsedProto)
        }

        return `  ${name}: ${scalarType}${(repeated || '') && '[]'}`
    }
}
