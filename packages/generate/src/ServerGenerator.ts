import { ExportCollector } from './utils'

interface GrpcServerGeneratorOptions {
    exportCollector: ExportCollector
}

export class GrpcTsServerGenerator {
    opts: GrpcServerGeneratorOptions

    constructor(opts: GrpcServerGeneratorOptions) {
        this.opts = opts
    }

    toTS() {
        this.opts.exportCollector.addExport('TS', `export * from "./server"`)

        return `export class GrpcServer {
	testProp: string
}`
    }

    toJS() {
        this.opts.exportCollector.addExport('JS', `export * from "./server"`)

        return `const { getGrpcServer } = require("@gprc_ts/server/src/runtime")
const { config } = require(".")

exports.GrpcServer = getGrpcServer(config)
`
    }
}
