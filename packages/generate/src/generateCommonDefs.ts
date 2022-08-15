import { ParsedProtoMap } from './types'

export const generateCommonProtoDefs = (parsedProtoPkgs: ParsedProtoMap) => {
    return Array.from(parsedProtoPkgs)
        .map(([name, { messages, enums, services }]) => {
            return `// ${name}
${
                messages.map(msg => {
                    return msg.toTS()
                }).join('\n\n')
            }
${
                enums.map(e => {
                    return e.toTS()
                }).join('\n\n')
            }
${
                services.map(service => {
                    return service.toTS()
                }).join('\n\n')
            }

				`
        }).join('\n')
}
