import fs from 'node:fs'
import path from 'node:path'

export const getOutputDir = async ({ cwd }: { cwd: string }): Promise<string> => {
	if (process.env.INIT_CWD && fs.existsSync(path.join(process.env.INIT_CWD, 'package.json')))
		return path.join(process.env.INIT_CWD, 'node_modules/.grpc_ts/output')



	return path.join(cwd, '../../.grpc_ts/output')
}
