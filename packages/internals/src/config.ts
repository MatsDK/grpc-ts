import readPkgUp from 'read-pkg-up'
import { z } from 'zod'

// `./package.json`
// "grpc_ts": {
//   "protoPaths": ["proto/*.proto"],
//   "generate": {
//     "server": true,
//     "client": false
//   }
// }
const gprcTsPkgJsonConfig = z.object({
    protoPaths: z.string().optional().or(z.string().array()),
    generate: z.object({
        server: z.boolean().optional(),
        client: z.boolean().optional(),
    }).optional(),
}).optional()

type GrpcTsConfig = z.infer<typeof gprcTsPkgJsonConfig>
type getConfigReturnType = {
    pkgPath: string
    config: GrpcTsConfig
}

let gprcTsConfig: getConfigReturnType

export const getGrpcTsConfigFromPkgJson = () => {
    if (gprcTsConfig) return gprcTsConfig
    const pkgJson = readPkgUp.sync({ cwd: process.cwd() })
    const GrpcTsPropertyFromPkgJson = pkgJson?.packageJson?.grpc_ts as GrpcTsConfig | undefined

    if (!pkgJson) return null

    const parseResult = gprcTsPkgJsonConfig.safeParse(GrpcTsPropertyFromPkgJson)
    if (!parseResult.success) {
        console.error(parseResult.error)
        return null
    }

    gprcTsConfig = {
        config: GrpcTsPropertyFromPkgJson,
        pkgPath: pkgJson.path,
    }

    return gprcTsConfig
}
