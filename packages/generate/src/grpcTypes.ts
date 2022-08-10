export const grpcScalarTypeToTSType = (grpcType: string) => {
    switch (grpcType) {
        case 'double':
        case 'float':
            // return 'number | string';
            return 'number'
        case 'int32':
        case 'uint32':
        case 'sint32':
        case 'fixed32':
        case 'sfixed32':
            return 'number'
        case 'int64':
        case 'uint64':
        case 'sint64':
        case 'fixed64':
        case 'sfixed64':
            // return 'number | string | Long';
            return 'number'
        case 'bool':
            return 'boolean'
        case 'string':
            return 'string'
        case 'bytes':
            return 'Buffer'
        default:
            return null
    }
}

export abstract class GrpcType {
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
