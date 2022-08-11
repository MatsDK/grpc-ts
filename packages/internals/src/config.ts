import type { ReadResult } from 'read-pkg-up'
import readPkgUp from 'read-pkg-up'
import { z } from 'zod'

// `./package.json`
// "grpc_ts": {
//   "protoPaths": ["proto/*.proto"]
// }
const gprcTsPkgJsonConfig = z.object({
    protoPaths: z.string().optional().or(z.string().array()),
}).optional()

type GrpcTsConfig = z.infer<typeof gprcTsPkgJsonConfig>

export const getGrpcTsConfigFromPkgJson = () => {
    const pkgJson = (readPkgUp as any).sync({ cwd: process.cwd() }) as ReadResult
    const GrpcTsPropertyFromPkgJson = pkgJson?.packageJson?.grpc_ts as GrpcTsConfig | undefined

    if (!pkgJson) return null

    const parseResult = gprcTsPkgJsonConfig.safeParse(GrpcTsPropertyFromPkgJson)
    if (!parseResult.success) {
        console.error(parseResult.error)
        return null
    }

    return {
        config: GrpcTsPropertyFromPkgJson,
        pkgPath: pkgJson.path,
    }
}
