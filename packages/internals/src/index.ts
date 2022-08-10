import type { ReadResult } from 'read-pkg-up'
import readPkgUp from 'read-pkg-up'

export const findProtoPaths = (
    schemaPathFromArgs?: string,
    opts: { cwd: string } = {
        cwd: process.cwd(),
    },
) => {
    console.log(opts, schemaPathFromArgs)
}

const getProtosPathFromPkgJson = () => {
    const { packageJson, path } = (readPkgUp as any).sync({ cwd: process.cwd() }) as ReadResult
    console.log(packageJson, path)
}
