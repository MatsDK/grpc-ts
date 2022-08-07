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
