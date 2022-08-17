import { GrpcEnum } from './Enum'
import { GrpcMessage } from './Message'
import { GrpcService } from './Service'

export interface ParsedPackage {
    messages: GrpcMessage[]
    enums: GrpcEnum[]
    services: GrpcService[]
}

export type ParsedPackages = Record<string, ParsedPackage>

export interface ParsedProto {
    parsedPackages: ParsedPackages
}
