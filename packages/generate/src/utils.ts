import { Field } from 'protobufjs'
import { ParsedProtoMap } from './types'

export const findMessageName = (field: Field, parsedProto: ParsedProtoMap) => {
    const { messages, enums } = getAllNamesFromParsedProto(parsedProto)
    if (!field.parent?.fullName) return field.type

    const parentNameParts = (field.parent.fullName.split('.'))

    for (let i = parentNameParts.length; i >= 0; i--) {
        const currName = formatName([...parentNameParts.slice(0, i), ...field.type.split('.')])

        if (messages.includes(currName) || enums.includes(currName)) {
            return currName
        }
    }

    return formatName(field.type.split('.'))
}

export const getAllNamesFromParsedProto = (parsedProto: ParsedProtoMap) => {
    let enumNames = [] as string[]
    let messageNames = [] as string[]

    parsedProto.forEach(({ messages, enums }, pkgName) => {
        messages.forEach(({ fullName }) => {
            messageNames.push(fullName)
        })
        enums.forEach(({ fullName }) => {
            enumNames.push(fullName)
        })
    })

    return { enums: enumNames, messages: messageNames }
}

export const formatName = (parts: string[]) =>
    parts
        .map(value => value.charAt(0).toUpperCase() + value.slice(1)).join('')
