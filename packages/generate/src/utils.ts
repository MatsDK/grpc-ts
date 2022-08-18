import { Field } from 'protobufjs'
import { TAB_SIZE } from './constants'
import { Package } from './Package'

export const findMessageName = (field: Field, parsedProto: Package) => {
    const { messages, enums } = getAllNamesFromPackage(parsedProto)
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

export const getAllNamesFromPackage = (pkg: Package) => {
    let enumNames = [] as string[]
    let messageNames = [] as string[]

    pkg.enums.forEach((e) => enumNames.push(e.fullName))
    pkg.messages.forEach((m) => messageNames.push(m.fullName))

    Object.entries(pkg.packages).forEach(([, nestedPkg]) => {
        const nestedNames = getAllNamesFromPackage(nestedPkg)
        enumNames = [...enumNames, ...nestedNames.enums]
        messageNames = [...messageNames, ...nestedNames.messages]
    })

    return { enums: enumNames, messages: messageNames }
}

export const msgNameExists = (pkg: Package, name: string) => {
    const { messages } = getAllNamesFromPackage(pkg)
    return messages.includes(name)
}

export const formatName = (parts: string[]) =>
    parts
        .map(value => value.charAt(0).toUpperCase() + value.slice(1)).join('')

export const i = (value: string) => value.split('\n').map(v => `${' '.repeat(TAB_SIZE)}${v}`).join('\n')
