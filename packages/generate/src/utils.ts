import { Field } from 'protobufjs'
import { TAB_SIZE } from './constants'
import { ParsedPackages } from './types'

export const findMessageName = (field: Field, parsedProto: ParsedPackages) => {
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

export const getAllNamesFromParsedProto = (parsedProto: ParsedPackages) => {
    let enumNames = [] as string[]
    let messageNames = [] as string[]

    Object.entries(parsedProto).forEach(([, { messages, enums }]) => {
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

export const i = (value: string) => {
    return value.split('\n').map(v => `${' '.repeat(TAB_SIZE)}${v}`).join('\n')
}
