import glob from 'glob'
import { resolve } from 'node:path'
import { getGrpcTsConfigFromPkgJson } from './config'

export const findProtoPaths = (
    protoPathsFromArgs?: string[],
) => {
    // 1. Try user-specified paths with `--proto` flag
    // 2. Try from package.json `grpc_ts` config
    const protoPaths = getProtoPathsFromArgs(protoPathsFromArgs)
        ?? getProtoPathsFromPkgJson()

    if (protoPaths) {
        return protoPaths
    }

    return null
}

const getProtoPathsFromArgs = (protoPathArgs?: string[]) => {
    if (!protoPathArgs) {
        return null
    }

    return protoPathArgs.flatMap(protoPath => glob.sync(resolve(protoPath)))
}

const getProtoPathsFromPkgJson = () => {
    const grpcTsConfig = getGrpcTsConfigFromPkgJson()

    if (!grpcTsConfig?.config?.protoPaths) return null

    const protoPaths = (Array.isArray(grpcTsConfig.config.protoPaths)
        ? grpcTsConfig.config.protoPaths
        : [grpcTsConfig.config.protoPaths])
        .flatMap(protoPath => glob.sync(resolve(protoPath)))

    return protoPaths
}
