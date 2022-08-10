import { GrpcEnum } from './Enum'
import { GrpcMessage } from './Message'

export type ParsedPackage = { messages: GrpcMessage[]; enums: GrpcEnum[] }
export type ParsedProtoMap = Map<string, ParsedPackage>
