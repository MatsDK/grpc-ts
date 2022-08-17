import { ParsedProto } from './types'
import { i } from './utils'

interface CommonDefsGeneratorOptions {
    parsedProto: ParsedProto['parsedPackages']
}

export class CommonDefsGenerator {
    readonly parsedPackages: ParsedProto['parsedPackages']

    constructor(readonly options: CommonDefsGeneratorOptions) {
        this.parsedPackages = options.parsedProto
    }

    toTS() {
        return `${defaultGrpcTSDefs()}
${
            Object.entries(this.parsedPackages)
                .map(([name, { messages, enums, services }]) => {
                    return `// ${name}

// Message definitions
${
                        messages.map(msg => {
                            return msg.toTS(this.parsedPackages)
                        }).join('\n\n')
                    }
// Enum definitions
${
                        enums.map(e => {
                            return e.toTS()
                        }).join('\n\n')
                    }
// Service definitions
${
                        services.map(service => {
                            return service.toTS(this.parsedPackages)
                        }).join('\n\n')
                    }

				`
                }).join('\n')
        }`
    }

    toJS() {
        return `const parsedDef = \`${JSON.stringify(this.parsedPackages)}\``
    }
}

const defaultGrpcTSDefs = () =>
    `declare namespace grpc_ts {

${
        i(`type Stream<T> = { 
${i(`inner: T`)}
}`)
    }

}`
