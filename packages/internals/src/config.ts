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
        server: z.boolean().default(true),
        client: z.boolean().default(true),
    }).optional(),
}).optional()

type GrpcTsConfig = z.infer<typeof gprcTsPkgJsonConfig>

export const getGrpcTsConfigFromPkgJson = () => {
    const pkgJson = readPkgUp.sync({ cwd: process.cwd() })
    const GrpcTsPropertyFromPkgJson = pkgJson?.packageJson?.grpc_ts as GrpcTsConfig | undefined

    if (!pkgJson) return null

    const parseResult = gprcTsPkgJsonConfig.safeParse(GrpcTsPropertyFromPkgJson)
    console.log(parseResult)
    if (!parseResult.success) {
        console.error(parseResult.error)
        return null
    }

    return {
        config: GrpcTsPropertyFromPkgJson,
        pkgPath: pkgJson.path,
    }
}
