import { GrpcMessage } from '../grpc'

export type MessagesMap = Map<string, GrpcMessage>

export const getNestedMessages = (messages: MessagesMap) => {
    const findNestedMessages = (message: GrpcMessage, nested_messages: MessagesMap = new Map()) => {
        Object.values(message._shape).forEach((msgProp) => {
            if (msgProp instanceof GrpcMessage) {
                nested_messages.set(msgProp._name, msgProp)
                findNestedMessages(msgProp, nested_messages)
            }
        })

        return nested_messages
    }

    let allMessages = new Map(messages)
    messages.forEach((msg) => {
        const res = findNestedMessages(msg)
        allMessages = new Map([...allMessages, ...res])
    })

    return allMessages
}
