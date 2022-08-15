import { GrpcEnum } from './Enum'
import { GrpcMessage } from './Message'
import { GrpcService } from './Service'

export type ParsedPackage = { messages: GrpcMessage[]; enums: GrpcEnum[]; services: GrpcService[] }
export type ParsedProtoMap = Map<string, ParsedPackage>
